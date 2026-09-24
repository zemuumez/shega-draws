package store

import (
	"context"
	"errors"
	"rimna/backend/internal/domain"
	"rimna/backend/internal/service"
	"sync/atomic"
	"testing"
)

type testProvider struct {
	starts    atomic.Int32
	uncertain bool
}

func (p *testProvider) Name() string           { return "chapa" }
func (p *testProvider) Supports(c string) bool { return c == "ETB" }
func (p *testProvider) Start(_ context.Context, o domain.Order) (domain.Checkout, error) {
	p.starts.Add(1)
	if o.AmountMinor != 2500 {
		return domain.Checkout{}, errors.New("untrusted price")
	}
	if p.uncertain {
		return domain.Checkout{}, domain.ErrUnavailable
	}
	return domain.Checkout{URL: "https://checkout.chapa.co/payment/test", Reference: "chapa-" + o.ID}, nil
}
func (p *testProvider) Verify(context.Context, string) (domain.Verification, error) {
	return domain.Verification{}, domain.ErrUnavailable
}
func (p *testProvider) AuthenticateWebhook([]byte, string) bool { return false }
func (p *testProvider) WebhookReference([]byte) (domain.Webhook, error) {
	return domain.Webhook{}, domain.ErrInvalid
}
func TestPurchaseRetriesDoNotStartAnotherPayment(t *testing.T) {
	st := testStore(t)
	p := &testProvider{}
	s := service.Service{Store: st, Providers: map[string]domain.PaymentProvider{"chapa": p}, Mode: "test"}
	ctx := context.Background()
	u := domain.User{ID: "user", Email: "user@example.test", Name: "User", Verified: true}
	request := domain.Purchase{DrawID: "draw1", Number: 1, Provider: "chapa", Phone: "+251911123456"}
	first, err := s.Purchase(ctx, u, "test-idempotency-key", request)
	if err != nil {
		t.Fatal(err)
	}
	again, err := s.Purchase(ctx, u, "test-idempotency-key", request)
	if err != nil || again.ID != first.ID || p.starts.Load() != 1 {
		t.Fatal("duplicate provider initialization", err)
	}
	request.Number = 2
	if _, err = s.Purchase(ctx, u, "test-idempotency-key", request); err != domain.ErrConflict {
		t.Fatal("changed replay accepted", err)
	}
	p.uncertain = true
	pending, err := s.Purchase(ctx, u, "another-test-attempt", request)
	if err != nil || pending.Status != "initializing" {
		t.Fatal(err)
	}
	s.Purchase(ctx, u, "another-test-attempt", request)
	if p.starts.Load() != 2 {
		t.Fatal("uncertain checkout was charged again")
	}
	u.Verified = false
	if _, err = s.Purchase(ctx, u, "unverified-attempt", request); err != domain.ErrInvalid {
		t.Fatal("unverified purchase accepted")
	}
}
func TestRefundKeepsIssuedNumberAndLedger(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	o, _, _ := s.Reserve(ctx, order("refund", "u", 9))
	v := domain.Verification{Reference: "ref", MerchantReference: o.ID, AmountMinor: 2500, Currency: "ETB", Mode: "test", Status: "success"}
	if err := s.ApplyPayment(ctx, o.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	v.Status = "fully_refunded"
	for i := 0; i < 2; i++ {
		if err := s.ApplyPayment(ctx, o.ID, v, "test"); err != nil {
			t.Fatal(err)
		}
	}
	o, _ = s.Order(ctx, o.ID)
	if !o.Refunded || o.Status != "paid" {
		t.Fatal("refund must remain auditable and number retained")
	}
	if _, _, err := s.Reserve(ctx, order("retry-refunded", "other", 9)); err != domain.ErrConflict {
		t.Fatal("refunded number resold")
	}
	var count int
	s.DB.QueryRow(ctx, "SELECT count(*) FROM payment_ledger").Scan(&count)
	if count != 2 {
		t.Fatal("refund ledger duplicated", count)
	}
}
func TestModeCannotChange(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	if err := s.EnsureMode(ctx, "test"); err != nil {
		t.Fatal(err)
	}
	if err := s.EnsureMode(ctx, "live"); err == nil {
		t.Fatal("test data promoted to live")
	}
}
