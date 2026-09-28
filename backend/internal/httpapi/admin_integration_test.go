package httpapi

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"net/http/httptest"
	"os"
	"rimna/backend/internal/domain"
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
	a := API{Store: &store.Store{DB: db}, Auth: staffTestIdentity{domain.User{ID: id, SessionID: id, Verified: true}}, Origin: "https://example.test"}
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
	request("session", 200)
	request("orders", 200)
	request("users", 403)
	request("overview", 403)
	request("operations", 403)
	request("audit", 403)
	if _, err = db.Exec(ctx, `UPDATE staff SET role='admin' WHERE user_id=$1`, id); err != nil {
		t.Fatal(err)
	}
	body := request("users?q="+id, 200)
	if !strings.Contains(body, id+"@example.test") || strings.Contains(body, "test-fixture") {
		t.Fatal("unexpected user directory response")
	}
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
