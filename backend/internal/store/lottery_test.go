package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"rimna/backend/internal/domain"
)

func sampleTemplate() domain.LotteryTemplate {
	return domain.LotteryTemplate{ID: "weekly", Active: true, LotterySettings: domain.LotterySettings{Title: "Weekly", Currency: "ETB", PriceMinor: 50000, Capacity: 100, Rules: domain.LotteryRules{Deductions: []domain.Deduction{{Label: "Operations", BPS: 2000}}, PrizeBPS: []int64{3500, 2000, 1200, 800, 600, 500, 400, 400, 300, 300}}}}
}
func createRound(t *testing.T, s *Store, id string, deadline time.Time) domain.RoundCommand {
	t.Helper()
	tpl := sampleTemplate()
	// Each test normally creates one template, subsequent round callers reuse it.
	templates, err := s.Templates(context.Background(), 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(templates.Items) == 0 {
		if err = s.SaveTemplate(context.Background(), "admin", tpl); err != nil {
			t.Fatal(err)
		}
	}
	c := domain.RoundCommand{LotterySettings: tpl.LotterySettings, Action: "save", TemplateID: tpl.ID, TemplateVersion: 1, Deadline: deadline}
	if err = s.SaveRound(context.Background(), "admin", id, c); err != nil {
		t.Fatal(err)
	}
	return c
}
func getRound(t *testing.T, s *Store, id string) domain.AdminRound {
	t.Helper()
	page, err := s.Rounds(context.Background(), 0)
	if err != nil {
		t.Fatal(err)
	}
	for _, r := range page.Items {
		if r.ID == id {
			return r
		}
	}
	t.Fatal("round not found", id)
	return domain.AdminRound{}
}
func moveRound(t *testing.T, s *Store, id, action string) {
	t.Helper()
	r := getRound(t, s, id)
	if err := s.SaveRound(context.Background(), "admin", id, domain.RoundCommand{Action: action, Version: r.Version}); err != nil {
		t.Fatal(action, err)
	}
}
func TestRoundLifecycleAndImmutableSnapshot(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	c := createRound(t, s, "r1", time.Now().Add(time.Hour))
	if r := getRound(t, s, "r1"); r.State != "draft" || r.TemplateVersion != 1 || *r.CurrentNetMinor != 0 || *r.MaximumNetMinor != 4000000 {
		t.Fatal(r)
	}
	c.Version = 1
	c.Title = "Updated draft"
	if err := s.SaveRound(ctx, "admin", "r1", c); err != nil {
		t.Fatal(err)
	}
	if err := s.SaveRound(ctx, "admin", "r1", c); err != domain.ErrConflict {
		t.Fatal("stale draft overwritten", err)
	}
	tpl := sampleTemplate()
	tpl.Version = 1
	tpl.PriceMinor = 75000
	tpl.Rules.PrizeBPS = []int64{1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000}
	if err := s.SaveTemplate(ctx, "admin", tpl); err != nil {
		t.Fatal(err)
	}
	if err := s.SaveTemplate(ctx, "admin", tpl); err != domain.ErrConflict {
		t.Fatal("stale template overwritten", err)
	}
	if r := getRound(t, s, "r1"); r.PriceMinor != 50000 || r.Rules.PrizeBPS[0] != 3500 {
		t.Fatal("template changed snapshot", r)
	}
	moveRound(t, s, "r1", "open")
	r := getRound(t, s, "r1")
	c.Version = r.Version
	c.Deadline = c.Deadline.Add(time.Hour)
	if err := s.SaveRound(ctx, "admin", "r1", c); err != domain.ErrConflict {
		t.Fatal("opened round edited", err)
	}
	if err := s.SaveDraw(ctx, "admin", r.Draw); err != domain.ErrConflict {
		t.Fatal("legacy helper bypass", err)
	}
	if _, err := s.DB.Exec(ctx, `UPDATE draws SET deadline=deadline+interval '1 hour' WHERE id='r1'`); err == nil {
		t.Fatal("SQL bypass allowed")
	}
	moveRound(t, s, "r1", "pause")
	o := order("pause", "p", 1)
	o.DrawID = "r1"
	if _, _, err := s.Reserve(ctx, o); err != domain.ErrClosed {
		t.Fatal("paused purchase", err)
	}
	c.Version = getRound(t, s, "r1").Version
	if err := s.SaveRound(ctx, "admin", "r1", c); err != domain.ErrConflict {
		t.Fatal("paused rules edited", err)
	}
	moveRound(t, s, "r1", "open")
	moveRound(t, s, "r1", "close")
	if err := s.SaveRound(ctx, "admin", "r1", domain.RoundCommand{Action: "open", Version: getRound(t, s, "r1").Version}); err != domain.ErrConflict {
		t.Fatal("closed round reopened", err)
	}
	var n int
	if err := s.DB.QueryRow(ctx, `SELECT count(*) FROM audit_log WHERE resource='r1' AND details->'after'->>'version' IS NOT NULL`).Scan(&n); err != nil || n != 6 {
		t.Fatal("missing audit snapshots", n, err)
	}
}
func TestRoundAvailabilityAndCollectionProjections(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	createRound(t, s, "r1", time.Now().Add(time.Hour))
	moveRound(t, s, "r1", "open")
	o := order("paid", "p", 1)
	o.DrawID = "r1"
	saved, _, err := s.Reserve(ctx, o)
	if err != nil {
		t.Fatal(err)
	}
	v := domain.Verification{MerchantReference: saved.ID, Reference: "verified-1", Currency: "ETB", AmountMinor: 50000, Mode: "test", Status: "success"}
	if err = s.ApplyPayment(ctx, saved.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	held := order("held", "h", 2)
	held.DrawID = "r1"
	if _, _, err = s.Reserve(ctx, held); err != nil {
		t.Fatal(err)
	}
	r := getRound(t, s, "r1")
	if r.Sold != 1 || r.Occupied != 2 || r.Remaining != 98 || *r.CurrentNetMinor != 40000 {
		t.Fatal(r)
	}
	v.Status = "fully_refunded"
	if err = s.ApplyPayment(ctx, saved.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	if _, err = s.DB.Exec(ctx, `UPDATE orders SET expires_at=now()-interval '1 minute' WHERE id='held'`); err != nil {
		t.Fatal(err)
	}
	r = getRound(t, s, "r1")
	if r.Sold != 0 || r.Occupied != 1 || r.Remaining != 99 || *r.CurrentNetMinor != 0 {
		t.Fatal(r)
	}
	legacy := getRound(t, s, "draw1")
	if legacy.CurrentNetMinor != nil {
		t.Fatal("invented legacy rules")
	}
	if err = s.SetSalesPaused(ctx, "admin", true, "Test global sales pause"); err != nil {
		t.Fatal(err)
	}
	held.ID = "blocked"
	held.Key = "blocked"
	held.Fingerprint = "blocked"
	if _, _, err = s.Reserve(ctx, held); err != domain.ErrPaused {
		t.Fatal("global pause bypass", err)
	}
}
func TestRoundClosingDateAndCompetingPurchases(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	createRound(t, s, "r1", time.Now().Add(time.Hour))
	moveRound(t, s, "r1", "open")
	var bought atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 25; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			o := order(fmt.Sprintf("buyer-%d", i), fmt.Sprintf("buyer-%d", i), 1)
			o.DrawID = "r1"
			_, created, err := s.Reserve(ctx, o)
			if err == nil && created {
				bought.Add(1)
			} else if !errors.Is(err, domain.ErrConflict) {
				t.Error(err)
			}
		}(i)
	}
	wg.Wait()
	if bought.Load() != 1 {
		t.Fatal("duplicate lucky number", bought.Load())
	}
	moveRound(t, s, "r1", "close")
	for i := 0; i < 5; i++ {
		o := order(fmt.Sprint(i), fmt.Sprint(i), i+2)
		o.DrawID = "r1"
		if _, _, err := s.Reserve(ctx, o); err != domain.ErrClosed {
			t.Fatal("post-close purchase", err)
		}
	}
	createRound(t, s, "deadline", time.Now().Add(500*time.Millisecond))
	moveRound(t, s, "deadline", "open")
	time.Sleep(550 * time.Millisecond)
	o := order("late", "late", 1)
	o.DrawID = "deadline"
	if _, _, err := s.Reserve(ctx, o); err != domain.ErrClosed {
		t.Fatal("late reservation", err)
	}
	r := getRound(t, s, "deadline")
	if r.State != "closed" {
		t.Fatal("deadline ignored", r)
	}
	if err := s.SaveRound(ctx, "admin", "deadline", domain.RoundCommand{Action: "open", Version: r.Version}); err != domain.ErrConflict {
		t.Fatal("expired reopened", err)
	}
	if err := s.Expire(ctx); err != nil {
		t.Fatal(err)
	}
	r = getRound(t, s, "deadline")
	if r.ClosedAt == nil || r.Status != "closed" {
		t.Fatal("worker did not close round")
	}
	if err := s.Expire(ctx); err != nil {
		t.Fatal(err)
	}
	var n int
	if err := s.DB.QueryRow(ctx, `SELECT count(*) FROM audit_log WHERE resource='deadline' AND action='round.close_deadline'`).Scan(&n); err != nil || n != 1 {
		t.Fatal("closure audit must occur once", n, err)
	}
}
func TestRoundValidationAndTemplateDeactivation(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	c := createRound(t, s, "r1", time.Now().Add(time.Hour))
	c.Version = 1
	bad := c
	bad.Rules.PrizeBPS = append([]int64(nil), c.Rules.PrizeBPS...)
	bad.Rules.PrizeBPS[0] = 1
	if err := s.SaveRound(ctx, "admin", "r1", bad); err != domain.ErrInvalid {
		t.Fatal("bad shares", err)
	}
	bad = c
	bad.LiveVideoURL = "javascript:alert(1)"
	if err := s.SaveRound(ctx, "admin", "r1", bad); err != domain.ErrInvalid {
		t.Fatal("unsafe URL", err)
	}
	tpl := sampleTemplate()
	tpl.Active = false
	tpl.Version = 1
	if err := s.SaveTemplate(ctx, "admin", tpl); err != nil {
		t.Fatal(err)
	}
	c.Version = 0
	if err := s.SaveRound(ctx, "admin", "new", c); err != domain.ErrConflict {
		t.Fatal("inactive template accepted", err)
	}
	// Pausing template creation does not silently stop a round already created.
	moveRound(t, s, "r1", "open")
	var details []byte
	if err := s.DB.QueryRow(ctx, `SELECT details FROM audit_log WHERE action='template.save' ORDER BY id DESC LIMIT 1`).Scan(&details); err != nil {
		t.Fatal(err)
	}
	var snapshot map[string]json.RawMessage
	if json.Unmarshal(details, &snapshot) != nil || snapshot["before"] == nil || snapshot["after"] == nil {
		t.Fatal("audit missing before/after")
	}
}

func TestConcurrentStaffEditsAndLegacyPause(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	createRound(t, s, "r1", time.Now().Add(time.Hour))
	var accepted atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			err := s.SaveRound(ctx, "staff", "r1", domain.RoundCommand{Action: "open", Version: 1})
			if err == nil {
				accepted.Add(1)
			} else if err != domain.ErrConflict {
				t.Error(err)
			}
		}()
	}
	wg.Wait()
	if accepted.Load() != 1 {
		t.Fatal("concurrent staff changes", accepted.Load())
	}
	moveRound(t, s, "draw1", "pause")
	moveRound(t, s, "draw1", "open")
	if r := getRound(t, s, "draw1"); r.Rules != nil || r.State != "open" {
		t.Fatal("legacy terms changed", r)
	}
	tpl := sampleTemplate()
	tpl.Version = 1
	tpl.Title = "New defaults"
	if err := s.SaveTemplate(ctx, "admin", tpl); err != nil {
		t.Fatal(err)
	}
	c := domain.RoundCommand{Action: "save", TemplateID: tpl.ID, TemplateVersion: 1, Deadline: time.Now().Add(time.Hour), LotterySettings: tpl.LotterySettings}
	if err := s.SaveRound(ctx, "admin", "stale-template", c); err != domain.ErrConflict {
		t.Fatal("stale template revision accepted", err)
	}
}

func TestManagedResultsRequireClosureAndNonRefundedTickets(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	createRound(t, s, "r1", time.Now().Add(time.Hour))
	moveRound(t, s, "r1", "open")
	o := order("winner", "buyer", 1)
	o.DrawID = "r1"
	saved, _, err := s.Reserve(ctx, o)
	if err != nil {
		t.Fatal(err)
	}
	v := domain.Verification{MerchantReference: saved.ID, Reference: "winner-ref", Currency: "ETB", AmountMinor: 50000, Mode: "test", Status: "success"}
	if err = s.ApplyPayment(ctx, saved.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	raw := []byte(`{"drawId":"r1","winningNumbers":[{"rank":1,"luckyNumber":"1","prizeAmount":"100","winnerName":"Fixture","payoutStatus":"pending"}]}`)
	moveRound(t, s, "r1", "pause")
	if err = s.AdminWrite(ctx, "admin", "results", "r1", raw); err != domain.ErrClosed {
		t.Fatal("paused round finalized", err)
	}
	moveRound(t, s, "r1", "close")
	v.Status = "fully_refunded"
	if err = s.ApplyPayment(ctx, saved.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	if err = s.AdminWrite(ctx, "admin", "results", "r1", raw); !errors.Is(err, domain.ErrInvalid) {
		t.Fatal("refunded ticket eligible", err)
	}
}

func TestEmptyDeductionsHaveStableArrayContract(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	tpl := sampleTemplate()
	tpl.Rules.Deductions = nil
	if err := s.SaveTemplate(ctx, "admin", tpl); err != nil {
		t.Fatal(err)
	}
	page, err := s.Templates(ctx, 0)
	if err != nil || page.Items[0].Rules.Deductions == nil {
		t.Fatal("template deductions must be an array", err)
	}
	c := domain.RoundCommand{Action: "save", TemplateID: tpl.ID, TemplateVersion: 1, LotterySettings: tpl.LotterySettings, Deadline: time.Now().Add(time.Hour)}
	if err = s.SaveRound(ctx, "admin", "r1", c); err != nil {
		t.Fatal(err)
	}
	if r := getRound(t, s, "r1"); r.Rules.Deductions == nil || *r.MaximumNetMinor != 5000000 {
		t.Fatal("round contract", r)
	}
}
