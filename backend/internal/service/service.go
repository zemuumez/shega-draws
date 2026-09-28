// Package service orchestrates business use cases through storage and payment ports.
package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log/slog"
	"regexp"
	"rimna/backend/internal/domain"
	"strings"
	"sync"
	"time"
)

type Repository interface {
	Draw(context.Context, string) (domain.Draw, error)
	Reserve(context.Context, domain.Order) (domain.Order, bool, error)
	Checkout(context.Context, string, domain.Checkout) error
	Order(context.Context, string) (domain.Order, error)
	ApplyPayment(context.Context, string, domain.Verification, string) error
	Work(context.Context) (domain.Order, error)
	FinishWork(context.Context, string, bool) error
	Expire(context.Context) error
	WorkerEnabled(context.Context, string) (bool, error)
}
type Service struct {
	Store                 Repository
	Providers             map[string]domain.PaymentProvider
	Mode                  string
	Wallet                WalletRepository
	Deposits              DepositPolicy
	VerificationPerMinute int
}

func ID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b[:])
}

var phone = regexp.MustCompile(`^\+[1-9][0-9]{7,14}$`)
var keyPattern = regexp.MustCompile(`^[a-zA-Z0-9_-]{16,100}$`)
var promoPattern = regexp.MustCompile(`^[A-Z0-9_-]{1,25}$`)

func (s *Service) Purchase(ctx context.Context, u domain.User, key string, p domain.Purchase) (domain.Order, error) {
	if !u.Verified || !keyPattern.MatchString(key) || !phone.MatchString(p.Phone) || p.Number < 1 || len(p.DrawID) > 100 || p.DrawID == "" {
		return domain.Order{}, domain.ErrInvalid
	}
	p.PromoCode = strings.ToUpper(strings.TrimSpace(p.PromoCode))
	if p.PromoCode != "" && !promoPattern.MatchString(p.PromoCode) {
		return domain.Order{}, domain.ErrInvalid
	}
	provider, ok := s.Providers[p.Provider]
	if !ok {
		return domain.Order{}, domain.ErrUnavailable
	}
	d, err := s.Store.Draw(ctx, p.DrawID)
	if err != nil {
		return domain.Order{}, err
	}
	if !provider.Supports(d.Currency) {
		return domain.Order{}, domain.ErrUnavailable
	}
	encoded, _ := json.Marshal(p)
	sum := sha256.Sum256(encoded)
	o := domain.Order{ID: ID(), UserID: u.ID, DrawID: p.DrawID, Number: p.Number, Provider: p.Provider, Key: key, Fingerprint: hex.EncodeToString(sum[:]), Phone: p.Phone, PromoCode: p.PromoCode, Email: u.Email, Name: u.Name}
	o, created, err := s.Store.Reserve(ctx, o)
	if err != nil || !created {
		return o, err
	}
	checkout, err := provider.Start(ctx, domain.CheckoutRequest{ID: o.ID, AmountMinor: o.AmountMinor, Currency: o.Currency, Phone: o.Phone, Email: o.Email, Name: o.Name})
	if err != nil { // Keep the hold and reconcile: the provider may have received it.
		slog.Warn("checkout outcome uncertain", "order", o.ID)
		return o, nil
	}
	if err = s.Store.Checkout(ctx, o.ID, checkout); err != nil {
		return o, err
	}
	o.CheckoutURL = checkout.URL
	o.Status = "pending"
	return o, nil
}
func (s *Service) Reconcile(ctx context.Context, o domain.Order) error {
	provider, ok := s.Providers[o.Provider]
	if !ok {
		return domain.ErrUnavailable
	}
	ref := o.ProviderReference
	if ref == "" {
		// Hosted initialization may return only a URL. The signed webhook supplies
		// the Chapa reference; merchant references are NOT accepted by /verify.
		return domain.ErrUnavailable
	}
	if err := s.verificationQuota(ctx, o.Provider); err != nil {
		return err
	}
	v, err := provider.Verify(ctx, ref)
	if err != nil {
		return err
	}
	return s.Store.ApplyPayment(ctx, o.ID, v, s.Mode)
}
func (s *Service) RunWorker(ctx context.Context) {
	workerID := ID()
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	expiry := time.NewTicker(time.Minute)
	defer expiry.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-expiry.C:
			if enabled, err := s.Store.WorkerEnabled(ctx, workerID); err != nil || !enabled {
				continue
			}
			if err := s.Store.Expire(ctx); err != nil {
				slog.Error("reservation expiry failed")
			}
			if s.Wallet != nil {
				if err := s.Wallet.DepositMaintenance(ctx); err != nil {
					slog.Error("deposit maintenance failed")
				}
			}
		case <-ticker.C:
			if enabled, err := s.Store.WorkerEnabled(ctx, workerID); err != nil || !enabled {
				continue
			}
			// Bounded work per worker; SKIP LOCKED leases allow horizontal worker scaling.
			var batch sync.WaitGroup
			for i := 0; i < 8; i++ {
				o, err := s.Store.Work(ctx)
				if errors.Is(err, domain.ErrNotFound) {
					break
				}
				if err != nil {
					slog.Error("payment work unavailable")
					break
				}
				batch.Add(1)
				go func(o domain.Order) {
					defer batch.Done()
					err := s.Reconcile(ctx, o)
					if err != nil {
						slog.Warn("payment verification deferred", "order", o.ID)
					}
					if e := s.Store.FinishWork(ctx, o.ID, err == nil); e != nil {
						slog.Error("payment lease completion failed")
					}
				}(o)
			}
			batch.Wait()
			s.runDepositBatch(ctx)
		}
	}
}
