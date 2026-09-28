package httpapi

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"net/http/httptest"
	"os"
	"rimna/backend/internal/domain"
	"rimna/backend/internal/payment/chapa"
	"rimna/backend/internal/service"
	"rimna/backend/internal/store"
	"rimna/backend/migrations"
	"strings"
	"testing"
	"time"
)

type staffTestIdentity struct{ user domain.User }

func (i staffTestIdentity) Verify(context.Context, string) (domain.User, error) { return i.user, nil }

func TestAdminEndpointRolesAndRevocation(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("requires isolated PostgreSQL with auth fixtures")
	}
	ctx := context.Background()
	base, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer base.Close()
	var ready bool
	if err = base.QueryRow(ctx, `SELECT to_regclass('auth.session') IS NOT NULL AND to_regclass('auth."user"') IS NOT NULL`).Scan(&ready); err != nil {
		t.Fatal(err)
	}
	if !ready {
		t.Skip("requires Better Auth user and session tables")
	}
	id := fmt.Sprintf("admin_api_%d", time.Now().UnixNano())
	if _, err = base.Exec(ctx, "CREATE SCHEMA "+id); err != nil {
		t.Fatal(err)
	}
	defer base.Exec(ctx, "DROP SCHEMA "+id+" CASCADE")
	cfg, _ := pgxpool.ParseConfig(dsn)
	cfg.ConnConfig.RuntimeParams["search_path"] = id
	db, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err = migrations.Apply(ctx, db); err != nil {
		t.Fatal(err)
	}
	if _, err = db.Exec(ctx, `INSERT INTO auth."user"(id,name,email,"emailVerified","twoFactorEnabled","createdAt","updatedAt") VALUES($1,'Fixture staff',$2,true,true,now(),now())`, id, id+"@example.test"); err != nil {
		t.Fatal(err)
	}
	defer db.Exec(ctx, `DELETE FROM auth."user" WHERE id=$1`, id)
	if _, err = db.Exec(ctx, `INSERT INTO auth.session(id,"userId","expiresAt",token,"createdAt","updatedAt") VALUES($1,$1,now()+interval '1 hour',$1,now(),now())`, id); err != nil {
		t.Fatal(err)
	}
	defer db.Exec(ctx, `DELETE FROM auth.session WHERE id=$1`, id)
	if _, err = db.Exec(ctx, `INSERT INTO staff(user_id,role) VALUES($1,'reviewer')`, id); err != nil {
		t.Fatal(err)
	}
	provider := chapa.New("test-fixture-key", "test-fixture-webhook", "test", []string{"ETB"})
	svc := &service.Service{Mode: "test", Providers: map[string]domain.PaymentProvider{"chapa": provider}}
	a := API{Service: svc, Store: &store.Store{DB: db}, Auth: staffTestIdentity{domain.User{ID: id, SessionID: id, Verified: true}}, Origin: "https://example.test"}
	svc.Wallet = a.Store
	svc.Store = a.Store
	h := a.Handler()
	request := func(path string, expected int) string {
		t.Helper()
		w := httptest.NewRecorder()
		r := httptest.NewRequest("GET", "/v1/admin/"+path, nil)
		r.Header.Set("Authorization", "Bearer test-fixture")
		h.ServeHTTP(w, r)
		if w.Code != expected {
			t.Fatalf("%s: got %d want %d: %s", path, w.Code, expected, w.Body.String())
		}
		return w.Body.String()
	}

	write := func(path string, input any, expected int) {
		t.Helper()
		raw, e := json.Marshal(input)
		if e != nil {
			t.Fatal(e)
		}
		w := httptest.NewRecorder()
		r := httptest.NewRequest("PUT", "/v1/admin/"+path, strings.NewReader(string(raw)))
		r.Header.Set("Authorization", "Bearer test-fixture")
		r.Header.Set("Content-Type", "application/json")
		h.ServeHTTP(w, r)
		if w.Code != expected {
			t.Fatalf("PUT %s: got %d want %d: %s", path, w.Code, expected, w.Body.String())
		}
	}
	request("wallets", 403)
	request("deposits", 403)
	write("deposits/missing", map[string]any{"reference": "ref"}, 403)
	write("operations/deposits", map[string]any{"paused": false, "reason": "Fixture enable"}, 403)
	request("templates", 200)
	request("rounds", 200)
	write("templates/weekly", map[string]any{}, 403)
	write("rounds/weekly", map[string]any{}, 403)
	request("session", 200)
	request("orders", 200)
	request("users", 403)
	request("overview", 403)
	request("operations", 403)
	request("audit", 403)
	if _, err = db.Exec(ctx, `UPDATE staff SET role='admin' WHERE user_id=$1`, id); err != nil {
		t.Fatal(err)
	}
	request("wallets", 200)
	request("deposits", 200)
	write("operations/deposits", map[string]any{"paused": false, "reason": "Fixture enable"}, 200)
	// Exercise real authenticated wallet handlers, owner filtering and signed callbacks.
	d, _, e := a.Store.CreateDeposit(ctx, domain.Deposit{ID: "dep_http_test", UserID: id, Currency: "ETB", AmountMinor: 2500, Provider: "chapa", Mode: "test", Key: "http-fixture-key", Fingerprint: "fixture", Phone: "+251911123456", Email: "fixture@example.test", Name: "Fixture"})
	if e != nil {
		t.Fatal(e)
	}
	_, _, e = a.Store.CreateDeposit(ctx, domain.Deposit{ID: "dep_private_other", UserID: "other", Currency: "USD", AmountMinor: 9000, Provider: "chapa", Mode: "test", Key: "other-key", Fingerprint: "other", Phone: "+251911123456", Email: "private@example.test", Name: "Private"})
	if e != nil {
		t.Fatal(e)
	}
	playerRequest := func(path string, expected int) string {
		t.Helper()
		w := httptest.NewRecorder()
		r := httptest.NewRequest("GET", "/v1/"+path, nil)
		r.Header.Set("Authorization", "Bearer fixture")
		h.ServeHTTP(w, r)
		if w.Code != expected {
			t.Fatalf("%s: %d %s", path, w.Code, w.Body.String())
		}
		return w.Body.String()
	}
	playerRequest("wallet", 200)
	playerRequest("wallet/history?currency=USD", 200)
	playerRequest("wallet/history?currency=EUR", 400)
	playerRequest("deposits/dep_private_other", 404)
	if b := playerRequest("deposits", 200); strings.Contains(b, "dep_private_other") || strings.Contains(b, "fixture@example.test") {
		t.Fatal("private deposit data leaked", b)
	}
	if b := playerRequest("deposits/"+d.ID, 200); !strings.Contains(b, d.ID) {
		t.Fatal(b)
	}
	webhook := []byte(`{"webhook_type":"payment","mode":"test","merchant_reference":"dep_http_test","chapa_reference":"http-chapa-reference"}`)
	mac := hmac.New(sha256.New, []byte("test-fixture-webhook"))
	mac.Write(webhook)
	sig := hex.EncodeToString(mac.Sum(nil))
	for _, signature := range []string{"forged", sig, sig} {
		w := httptest.NewRecorder()
		r := httptest.NewRequest("POST", "/v1/webhooks/chapa", strings.NewReader(string(webhook)))
		r.Header.Set("X-Chapa-Signature", signature)
		h.ServeHTTP(w, r)
		expected := 200
		if signature == "forged" {
			expected = 401
		}
		if w.Code != expected {
			t.Fatalf("webhook: %d %s", w.Code, w.Body.String())
		}
	}
	if b, e := a.Store.WalletBalances(ctx, id); e != nil || b[0].AvailableMinor != 0 {
		t.Fatal("webhook credited without verification", b, e)
	}
	d, e = a.Store.Deposit(ctx, d.ID)
	if e != nil || d.ProviderReference != "http-chapa-reference" {
		t.Fatal(d, e)
	}
	write("deposits/"+d.ID, map[string]any{"reference": d.ProviderReference}, 200)
	write("deposits/"+d.ID, map[string]any{"reference": "replacement"}, 409)
	if b := playerRequest("wallet/history?currency=ETB", 200); strings.Contains(b, "2500") {
		t.Fatal("scheduled verification must not credit", b)
	}
	write("operations/deposits", map[string]any{"paused": true, "reason": "Fixture pause"}, 200)
	body := request("users?q="+id, 200)
	if !strings.Contains(body, id+"@example.test") || strings.Contains(body, "test-fixture") {
		t.Fatal("unexpected user directory response")
	}

	template := domain.LotteryTemplate{ID: "weekly", Active: true, LotterySettings: domain.LotterySettings{Title: "Weekly", Currency: "ETB", PriceMinor: 50000, Capacity: 100, Rules: domain.LotteryRules{Deductions: []domain.Deduction{}, PrizeBPS: []int64{1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000}}}}
	write("templates/weekly", template, 200)
	write("templates/weekly", template, 409)
	write("templates/wrong-id", template, 400)
	round := domain.RoundCommand{Action: "save", TemplateID: "weekly", TemplateVersion: 1, LotterySettings: template.LotterySettings, Deadline: time.Now().Add(time.Hour)}
	write("rounds/round1", round, 200)
	write("rounds/round1", map[string]any{"action": "open", "version": 1}, 200)
	write("rounds/round1", map[string]any{"action": "pause", "version": 1}, 409)
	round.Version = 2
	write("rounds/round1", round, 409)
	write("draws/round1", map[string]any{}, 403)
	write("rounds/round1", map[string]any{"action": "pause", "version": 2, "unexpected": true}, 400)
	request("overview", 200)
	request("users?q="+strings.Repeat("x", 101), 400)
	request("unknown", 403)
	if _, err = db.Exec(ctx, `UPDATE staff SET enabled=false WHERE user_id=$1`, id); err != nil {
		t.Fatal(err)
	}
	request("users", 403)
	if _, err = db.Exec(ctx, `UPDATE staff SET enabled=true WHERE user_id=$1`, id); err != nil {
		t.Fatal(err)
	}
	if _, err = db.Exec(ctx, `UPDATE auth."user" SET "twoFactorEnabled"=false WHERE id=$1`, id); err != nil {
		t.Fatal(err)
	}
	request("session", 403)
	if _, err = db.Exec(ctx, `UPDATE auth.session SET "expiresAt"=now()-interval '1 second' WHERE id=$1`, id); err != nil {
		t.Fatal(err)
	}
	request("session", 401)
}
