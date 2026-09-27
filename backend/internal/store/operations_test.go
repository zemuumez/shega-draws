package store

import (
	"context"
	"fmt"
	"rimna/backend/internal/domain"
	"rimna/backend/internal/service"
	"sync"
	"sync/atomic"
	"testing"
)

func TestGlobalPauseAndRecovery(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	initial, _, err := s.Reserve(ctx, order("existing", "u", 1))
	if err != nil {
		t.Fatal(err)
	}
	if err = s.SetSalesPaused(ctx, "admin", true, "Incident investigation"); err != nil {
		t.Fatal(err)
	}
	if _, _, err = s.Reserve(ctx, order("blocked", "b", 2)); err != domain.ErrPaused {
		t.Fatal("paused purchase accepted", err)
	}
	if _, created, err := s.Reserve(ctx, order("existing", "u", 1)); err != nil || created {
		t.Fatal("replay lost during pause", err)
	}
	if err = s.ApplyPayment(ctx, initial.ID, domain.Verification{Reference: "paid-ref", MerchantReference: initial.ID, Currency: "ETB", AmountMinor: 2500, Mode: "test", Status: "success"}, "test"); err != nil {
		t.Fatal("pause blocked existing payment", err)
	}
	if err = s.SetSalesPaused(ctx, "admin", false, "Incident resolved"); err != nil {
		t.Fatal(err)
	}
	if _, _, err = s.Reserve(ctx, order("resumed", "c", 2)); err != nil {
		t.Fatal(err)
	}
	if _, err = s.DB.Exec(ctx, `UPDATE operations_control SET recovery_locked=true`); err != nil {
		t.Fatal(err)
	}
	if err = s.SetSalesPaused(ctx, "admin", false, "Attempt resume"); err != domain.ErrConflict {
		t.Fatal("recovery lock bypassed")
	}
	if err = s.ApplyPayment(ctx, initial.ID, domain.Verification{}, "test"); err != domain.ErrUnavailable {
		t.Fatal("recovery payment mutation accepted", err)
	}
	if enabled, err := s.WorkerEnabled(ctx, "worker"); err != nil || enabled {
		t.Fatal("worker ran on recovered database", err)
	}
	if _, _, err = s.Reserve(ctx, order("recovery", "d", 3)); err != domain.ErrPaused {
		t.Fatal("recovered sale accepted", err)
	}
}
func TestBackupRequestDeduplication(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	if err := s.RequestBackup(ctx, "admin", service.ID()); err != nil {
		t.Fatal(err)
	}
	if err := s.RequestBackup(ctx, "admin", service.ID()); err != domain.ErrConflict {
		t.Fatal("multiple backup jobs accepted", err)
	}
	state, err := s.Operations(ctx)
	if err != nil || len(state.Backups) != 1 || state.Backups[0].Status != "queued" {
		t.Fatal(state, err)
	}
}
func TestConcurrentPaymentRetriesAcrossInstances(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	provider := &testProvider{}
	var starts atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			api := service.Service{Store: s, Providers: map[string]domain.PaymentProvider{"chapa": provider}, Mode: "test"}
			o, err := api.Purchase(ctx, domain.User{ID: "same-user", Email: "test@example.test", Verified: true}, "concurrent-idempotency", domain.Purchase{DrawID: "draw1", Number: 77, Provider: "chapa", Phone: "+251911123456"})
			if err != nil {
				t.Error(err)
				return
			}
			if o.Number != 77 {
				t.Error("wrong number")
			}
			starts.Add(1)
		}()
	}
	wg.Wait()
	if starts.Load() != 100 || provider.starts.Load() != 1 {
		t.Fatalf("successes=%d provider initializations=%d", starts.Load(), provider.starts.Load())
	}
}
func TestConcurrentVerifiedPaymentAndWorkerClaims(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	o, _, err := s.Reserve(ctx, order("verified", "u", 42))
	if err != nil {
		t.Fatal(err)
	}
	v := domain.Verification{Reference: "provider-42", MerchantReference: o.ID, Currency: "ETB", AmountMinor: 2500, Mode: "test", Status: "success"}
	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := s.ApplyPayment(ctx, o.ID, v, "test"); err != nil {
				t.Error(err)
			}
		}()
	}
	wg.Wait()
	var n int
	if err = s.DB.QueryRow(ctx, `SELECT count(*) FROM payment_ledger`).Scan(&n); err != nil || n != 1 {
		t.Fatal("duplicate ledger", n, err)
	}
	if _, err = s.DB.Exec(ctx, `UPDATE orders SET next_check_at=now()`); err != nil {
		t.Fatal(err)
	}
	var claims atomic.Int32
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_, err := s.Work(ctx)
			if err == nil {
				claims.Add(1)
			} else if err != domain.ErrNotFound {
				t.Error(err)
			}
		}()
	}
	wg.Wait()
	if claims.Load() != 1 {
		t.Fatal("job leased more than once", claims.Load())
	}
	// Same payment reference cannot pay another order.
	second, _, err := s.Reserve(ctx, order("second", "b", 43))
	if err != nil {
		t.Fatal(err)
	}
	v.MerchantReference = second.ID
	if err = s.ApplyPayment(ctx, second.ID, v, "test"); err != domain.ErrConflict {
		t.Fatal(fmt.Sprintf("provider transaction reused: %v", err))
	}
}
