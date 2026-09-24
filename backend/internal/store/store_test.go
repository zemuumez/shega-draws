package store

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"os"
	"rimna/backend/internal/domain"
	"rimna/backend/migrations"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func testStore(t *testing.T) *Store {
	t.Helper()
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set TEST_DATABASE_URL to run PostgreSQL integration tests")
	}
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal(err)
	}
	schema := fmt.Sprintf("test_%d", time.Now().UnixNano())
	if _, err = pool.Exec(ctx, "CREATE SCHEMA "+schema); err != nil {
		t.Fatal(err)
	}
	cfg, _ := pgxpool.ParseConfig(dsn)
	cfg.MaxConns = 25
	cfg.ConnConfig.RuntimeParams["search_path"] = schema
	db, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close(); pool.Exec(ctx, "DROP SCHEMA "+schema+" CASCADE"); pool.Close() })
	if err = migrations.Apply(ctx, db); err != nil {
		t.Fatal(err)
	}
	s := &Store{DB: db}
	err = s.SaveDraw(ctx, "test", domain.Draw{ID: "draw1", Title: "Test", Currency: "ETB", PriceMinor: 2500, Capacity: 25000, Status: "open", Deadline: time.Now().Add(time.Hour)})
	if err != nil {
		t.Fatal(err)
	}
	return s
}
func order(id, user string, n int) domain.Order {
	return domain.Order{ID: id, UserID: user, DrawID: "draw1", Number: n, Provider: "chapa", Key: id, Fingerprint: id, Phone: "+251911123456", Email: "test@example.test", Name: "Test"}
}
func TestConcurrentNumberReservation(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	var winners atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			o := order(fmt.Sprint(i), fmt.Sprint(i), 42)
			_, created, err := s.Reserve(ctx, o)
			if err == nil && created {
				winners.Add(1)
			} else if err != domain.ErrConflict {
				t.Errorf("unexpected conflict error: %v", err)
			}
		}(i)
	}
	wg.Wait()
	if winners.Load() != 1 {
		t.Fatalf("oversold: %d owners", winners.Load())
	}
}
func TestIdempotencyAndLimit(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	o := order("same", "u", 1)
	first, created, err := s.Reserve(ctx, o)
	if err != nil || !created {
		t.Fatal(err)
	}
	again, created, err := s.Reserve(ctx, o)
	if err != nil || created || again.ID != first.ID {
		t.Fatal("retry not idempotent", err)
	}
	o.Fingerprint = "changed"
	if _, _, err = s.Reserve(ctx, o); err != domain.ErrConflict {
		t.Fatal("accepted changed payload")
	}
	for i := 2; i <= 3; i++ {
		_, _, err = s.Reserve(ctx, order(fmt.Sprint(i), "u", i))
		if err != nil {
			t.Fatal(err)
		}
	}
	if _, _, err = s.Reserve(ctx, order("4", "u", 4)); err != domain.ErrRate {
		t.Fatal("hold limit missing", err)
	}
}
func TestPaymentIntegrityAndLateSuccess(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	o, _, err := s.Reserve(ctx, order("one", "a", 1))
	if err != nil {
		t.Fatal(err)
	}
	v := domain.Verification{Reference: "provider1", MerchantReference: o.ID, Currency: "ETB", AmountMinor: 2500, Status: "success", Mode: "test"}
	bad := v
	bad.AmountMinor = 1
	if err = s.ApplyPayment(ctx, o.ID, bad, "test"); err != domain.ErrInvalid {
		t.Fatal("accepted wrong amount")
	}
	bad = v
	bad.Mode = "live"
	if err = s.ApplyPayment(ctx, o.ID, bad, "test"); err != domain.ErrInvalid {
		t.Fatal("accepted wrong mode")
	}
	for i := 0; i < 3; i++ {
		if err = s.ApplyPayment(ctx, o.ID, v, "test"); err != nil {
			t.Fatal(err)
		}
	}
	var n int
	s.DB.QueryRow(ctx, `SELECT count(*) FROM payment_ledger`).Scan(&n)
	if n != 1 {
		t.Fatal("duplicated payment")
	}
	late, _, _ := s.Reserve(ctx, order("late", "b", 2))
	s.DB.Exec(ctx, `UPDATE orders SET expires_at=now()-interval '1 second' WHERE id=$1`, late.ID)
	replacement, _, err := s.Reserve(ctx, order("replacement", "c", 2))
	if err != nil {
		t.Fatal(err)
	}
	v.MerchantReference = late.ID
	v.Reference = "late-provider"
	if err = s.ApplyPayment(ctx, late.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	late, _ = s.Order(ctx, late.ID)
	if late.Status != "refund_required" {
		t.Fatal("late payment issued duplicate ticket")
	}
	replacement, _ = s.Order(ctx, replacement.ID)
	if replacement.Status != "initializing" {
		t.Fatal("replacement overwritten")
	}
}
func TestWorkerLeaseAndWebhook(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	o, _, _ := s.Reserve(ctx, order("work", "u", 3))
	if err := s.Webhook(ctx, "chapa", "digest", o.ID, "chapa-work"); err != nil {
		t.Fatal(err)
	}
	s.Webhook(ctx, "chapa", "digest", o.ID, "chapa-work")
	claimed, err := s.Work(ctx)
	if err != nil || claimed.ID != o.ID {
		t.Fatal(claimed, err)
	}
	if _, err = s.Work(ctx); err != domain.ErrNotFound {
		t.Fatal("work double leased", err)
	}
	var n int
	s.DB.QueryRow(ctx, "SELECT count(*) FROM webhook_events").Scan(&n)
	if n != 1 {
		t.Fatal("webhook not deduplicated")
	}
}
func TestAvailabilityAndDrawRules(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	s.Reserve(ctx, order("number101", "a", 101))
	v, err := s.Availability(ctx, "draw1", 1, 100)
	if err != nil {
		t.Fatal(err)
	}
	if len(v["takenNumbers"].([]int)) != 0 || v["remaining"].(int) != 24999 {
		t.Fatal(v)
	}
	d := domain.Draw{ID: "draw1", Title: "Updated", Currency: "ETB", PriceMinor: 3000, Capacity: 25000, Status: "open", Deadline: time.Now().Add(time.Hour)}
	if err = s.SaveDraw(ctx, "staff", d); err != domain.ErrConflict {
		t.Fatal("price mutated", err)
	}
	d.PriceMinor = 2500
	d.Status = "closed"
	s.SaveDraw(ctx, "staff", d)
	if _, _, err = s.Reserve(ctx, order("closed", "b", 2)); err != domain.ErrClosed {
		t.Fatal("closed draw sold")
	}
}
func TestResultsRequirePaidTickets(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	raw, _ := json.Marshal(map[string]any{"drawId": "draw1", "winningNumbers": []any{map[string]any{"rank": 1, "luckyNumber": "42"}}})
	if err := s.AdminWrite(ctx, "admin", "results", "draw1", raw); err != domain.ErrClosed {
		t.Fatal(err)
	}
	s.DB.Exec(ctx, `UPDATE draws SET status='closed'`)
	if err := s.AdminWrite(ctx, "admin", "results", "draw1", raw); err == nil || !strings.Contains(err.Error(), "issued ticket") {
		t.Fatal(err)
	}
}
func TestTwentyFiveThousandReservations(t *testing.T) {
	if os.Getenv("RUN_LOAD_TEST") != "1" {
		t.Skip("opt-in load test")
	}
	s := testStore(t)
	ctx := context.Background()
	start := time.Now()
	jobs := make(chan int)
	var failed atomic.Int32
	var wg sync.WaitGroup
	for worker := 0; worker < 100; worker++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for n := range jobs {
				id := fmt.Sprintf("load-%d", n)
				if _, _, err := s.Reserve(ctx, order(id, id, n)); err != nil {
					failed.Add(1)
				}
			}
		}()
	}
	for n := 1; n <= 25000; n++ {
		jobs <- n
	}
	close(jobs)
	wg.Wait()
	if failed.Load() != 0 {
		t.Fatalf("failed %d", failed.Load())
	}
	var count int
	s.DB.QueryRow(ctx, `SELECT count(DISTINCT number) FROM orders`).Scan(&count)
	if count != 25000 {
		t.Fatal("wrong capacity", count)
	}
	t.Logf("25,000 distinct buyers, 100 concurrent workers, elapsed=%s; database reservation test only", time.Since(start))
}
