package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log/slog"
	"rimna/backend/internal/domain"
	"strings"
	"sync"
)

type WalletRepository interface {
	CreateDeposit(context.Context, domain.Deposit) (domain.Deposit, bool, error)
	DepositCheckout(context.Context, string, domain.Checkout) error
	ApplyDeposit(context.Context, string, domain.Verification, string) error
	ReviewDeposit(context.Context, string, string) error
	DepositWork(context.Context) (domain.Deposit, error)
	FinishDepositWork(context.Context, string, bool) error
	DepositMaintenance(context.Context) error
	Rate(context.Context, string, int) error
}
type DepositPolicy struct {
	Enabled  bool   `json:"enabled"`
	Currency string `json:"currency"`
	MinMinor int64  `json:"minMinor"`
	MaxMinor int64  `json:"maxMinor"`
}

// DepositPolicyFor never falls back across currencies.
func (s *Service) DepositPolicyFor(currency string) DepositPolicy {
	if s.DepositPolicies != nil {
		if p, ok := s.DepositPolicies[currency]; ok {
			return p
		}
		return DepositPolicy{Currency: currency}
	}
	if s.Deposits.Currency == currency {
		return s.Deposits
	}
	return DepositPolicy{Currency: currency}
}

func normalizePhone(raw string) string {
	raw = strings.TrimSpace(raw)
	raw = strings.ReplaceAll(raw, " ", "")
	raw = strings.ReplaceAll(raw, "-", "")
	raw = strings.ReplaceAll(raw, "(", "")
	raw = strings.ReplaceAll(raw, ")", "")
	if strings.HasPrefix(raw, "+") {
		return raw
	}
	if strings.HasPrefix(raw, "09") || strings.HasPrefix(raw, "07") {
		return "+251" + raw[1:]
	}
	if (strings.HasPrefix(raw, "9") || strings.HasPrefix(raw, "7")) && len(raw) == 9 {
		return "+251" + raw
	}
	if strings.HasPrefix(raw, "251") {
		return "+" + raw
	}
	return raw
}

func (s *Service) StartDeposit(ctx context.Context, u domain.User, key string, p domain.DepositRequest) (domain.Deposit, error) {
	p.Phone = normalizePhone(p.Phone)
	if p.Phone == "" && p.Currency == "ETB" {
		p.Phone = "+251911000000"
	}
	if !u.Verified || !keyPattern.MatchString(key) || !phone.MatchString(p.Phone) || p.AmountMinor < 1 || p.AmountMinor > 100000000 {
		return domain.Deposit{}, domain.ErrInvalid
	}
	policy := s.DepositPolicyFor(p.Currency)
	if s.Wallet == nil || !policy.Enabled {
		return domain.Deposit{}, domain.ErrUnavailable
	}
	if p.AmountMinor < policy.MinMinor || p.AmountMinor > policy.MaxMinor {
		return domain.Deposit{}, domain.ErrInvalid
	}
	provider, ok := s.Providers[p.Provider]
	if !ok || !provider.Supports(p.Currency) {
		return domain.Deposit{}, domain.ErrUnavailable
	}
	raw, _ := json.Marshal(p)
	fingerprint := sha256.Sum256(raw)
	d := domain.Deposit{ID: "dep_" + ID(), UserID: u.ID, Currency: p.Currency, AmountMinor: p.AmountMinor, Provider: p.Provider, Mode: s.Mode, Key: key, Fingerprint: hex.EncodeToString(fingerprint[:]), Phone: p.Phone, Email: u.Email, Name: u.Name}
	d, created, err := s.Wallet.CreateDeposit(ctx, d)
	if err != nil || !created {
		return d, err
	}
	checkout, err := provider.Start(ctx, d.CheckoutRequest())
	if err != nil { // Never restart an ambiguous initialization automatically.
		slog.Warn("deposit checkout outcome uncertain", "deposit", d.ID)
		return d, nil
	}
	if err = s.Wallet.DepositCheckout(ctx, d.ID, checkout); err != nil {
		return d, err
	}
	// A concurrent webhook may already have credited the deposit. The response
	// is deliberately pending; the next authenticated read is authoritative.
	d.CheckoutURL = checkout.URL
	d.ProviderReference = checkout.Reference
	d.Status = "pending"
	return d, nil
}
func (s *Service) ReconcileDeposit(ctx context.Context, d domain.Deposit) error {
	if s.Wallet == nil {
		return domain.ErrUnavailable
	}
	p, ok := s.Providers[d.Provider]
	if !ok || d.ProviderReference == "" {
		return domain.ErrUnavailable
	}
	if err := s.verificationQuota(ctx, d.Provider); err != nil {
		return err
	}
	v, err := p.Verify(ctx, d.ProviderReference)
	if err != nil {
		return err
	}
	// The provider may return a different reference; never accept that response.
	if v.Reference != d.ProviderReference {
		err = domain.ErrInvalid
	} else {
		err = s.Wallet.ApplyDeposit(ctx, d.ID, v, s.Mode)
	}
	if errors.Is(err, domain.ErrInvalid) || errors.Is(err, domain.ErrConflict) {
		if e := s.Wallet.ReviewDeposit(ctx, d.ID, "Payment verification needs staff review; funds were not newly credited."); e != nil {
			return e
		}
	}
	return err
}
func (s *Service) verificationQuota(ctx context.Context, provider string) error {
	if s.Wallet != nil && s.VerificationPerMinute > 0 {
		return s.Wallet.Rate(ctx, "provider-verification:"+provider, s.VerificationPerMinute)
	}
	return nil
}
func (s *Service) runDepositBatch(ctx context.Context) {
	if s.Wallet == nil {
		return
	}
	var wg sync.WaitGroup
	for i := 0; i < 4; i++ {
		d, err := s.Wallet.DepositWork(ctx)
		if errors.Is(err, domain.ErrNotFound) {
			break
		}
		if err != nil {
			slog.Error("deposit work unavailable")
			break
		}
		wg.Add(1)
		go func(d domain.Deposit) {
			defer wg.Done()
			e := s.ReconcileDeposit(ctx, d)
			if e != nil {
				slog.Warn("deposit verification deferred", "deposit", d.ID)
			}
			if err := s.Wallet.FinishDepositWork(ctx, d.ID, e == nil); err != nil {
				slog.Error("deposit lease completion failed")
			}
		}(d)
	}
	wg.Wait()
}
