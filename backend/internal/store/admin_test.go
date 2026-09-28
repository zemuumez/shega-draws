package store

import (
	"context"
	"fmt"
	"rimna/backend/internal/domain"
	"testing"
	"time"
)

func TestAdminOverviewAndDrawPages(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	o, _, err := s.Reserve(ctx, order("admin-paid", "buyer", 17))
	if err != nil {
		t.Fatal(err)
	}
	v := domain.Verification{Reference: "admin-ref", MerchantReference: o.ID, Currency: "ETB", AmountMinor: 2500, Status: "success", Mode: "test"}
	if err = s.ApplyPayment(ctx, o.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	if _, _, err = s.Reserve(ctx, order("admin-pending", "pending-buyer", 18)); err != nil {
		t.Fatal(err)
	}
	overview, err := s.AdminOverview(ctx)
	if err != nil || overview.OpenRounds != 1 || overview.IssuedTickets != 1 || overview.PendingPayments != 1 || len(overview.Collections) != 1 || overview.Collections[0].PaidMinor != 2500 {
		t.Fatalf("unexpected overview: %+v %v", overview, err)
	}
	v.Status = "fully_refunded"
	if err = s.ApplyPayment(ctx, o.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	if _, err = s.DB.Exec(ctx, `UPDATE draws SET deadline=now()-interval '1 second' WHERE id='draw1'`); err != nil {
		t.Fatal(err)
	}
	overview, err = s.AdminOverview(ctx)
	if err != nil || overview.OpenRounds != 0 || overview.IssuedTickets != 0 || overview.Collections[0].RefundedMinor != 2500 {
		t.Fatalf("refund/deadline counts wrong: %+v %v", overview, err)
	}
	if _, err = s.DB.Exec(ctx, `INSERT INTO draws(id,title,currency,price_minor,capacity,status,deadline) SELECT 'page-'||n,'Round '||n,'ETB',2500,25000,'closed',now() FROM generate_series(1,105) n`); err != nil {
		t.Fatal(err)
	}
	first, err := s.AdminDraws(ctx, 0)
	if err != nil || len(first) != 100 {
		t.Fatal(len(first), err)
	}
	second, err := s.AdminDraws(ctx, 100)
	if err != nil || len(second) != 6 {
		t.Fatal(len(second), err)
	}
	seen := map[string]bool{}
	for _, d := range first {
		seen[d.ID] = true
	}
	for _, d := range second {
		if seen[d.ID] {
			t.Fatal("duplicate paged round")
		}
	}
}

// Requires a disposable test database with the Better Auth user table.
func TestAdminUserDirectoryPrivacyAndSearch(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	var present bool
	if err := s.DB.QueryRow(ctx, `SELECT to_regclass('auth."user"') IS NOT NULL`).Scan(&present); err != nil {
		t.Fatal(err)
	}
	if !present {
		t.Skip("requires Better Auth user table in the isolated test database")
	}
	prefix := fmt.Sprintf("admin-test-%d", time.Now().UnixNano())
	t.Cleanup(func() { s.DB.Exec(ctx, `DELETE FROM auth."user" WHERE id LIKE $1`, prefix+"%") })
	for i := 0; i < 55; i++ {
		name := prefix + " person"
		if i == 54 {
			name = prefix + " %special"
		}
		if _, err := s.DB.Exec(ctx, `INSERT INTO auth."user"(id,name,email,"emailVerified","twoFactorEnabled","createdAt","updatedAt") VALUES($1,$2,$3,true,false,now(),now())`, fmt.Sprintf("%s-%02d", prefix, i), name, fmt.Sprintf("%s-%02d@example.test", prefix, i)); err != nil {
			t.Fatal(err)
		}
	}
	page, err := s.AdminUsers(ctx, prefix, 0)
	if err != nil || len(page.Items) != 50 || !page.HasMore {
		t.Fatal(page, err)
	}
	next, err := s.AdminUsers(ctx, prefix, 50)
	if err != nil || len(next.Items) != 5 || next.HasMore {
		t.Fatal(next, err)
	}
	for _, u := range next.Items {
		for _, old := range page.Items {
			if old.ID == u.ID {
				t.Fatal("user repeated across pages")
			}
		}
		if u.Role != "player" {
			t.Fatal("unexpected staff grant")
		}
	}
	literal, err := s.AdminUsers(ctx, prefix+" %", 0)
	if err != nil || len(literal.Items) != 1 {
		t.Fatal("wildcard expanded", literal, err)
	}
	if _, err = s.AdminUsers(ctx, "", -1); err != domain.ErrInvalid {
		t.Fatal("invalid offset accepted")
	}
}
