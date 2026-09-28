package migrations

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"os"
	"testing"
	"time"
)

func TestLotteryUpgradePreservesHistoricalRecords(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("requires isolated PostgreSQL")
	}
	ctx := context.Background()
	base, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer base.Close()
	schema := fmt.Sprintf("upgrade_%d", time.Now().UnixNano())
	if _, err = base.Exec(ctx, "CREATE SCHEMA "+schema); err != nil {
		t.Fatal(err)
	}
	defer base.Exec(ctx, "DROP SCHEMA "+schema+" CASCADE")
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		t.Fatal(err)
	}
	cfg.ConnConfig.RuntimeParams["search_path"] = schema
	db, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	for _, name := range []string{"001_core.sql", "002_payment_safety.sql", "003_operations.sql"} {
		raw, e := Files.ReadFile(name)
		if e != nil {
			t.Fatal(e)
		}
		if _, e = db.Exec(ctx, string(raw)); e != nil {
			t.Fatal(e)
		}
		if _, e = db.Exec(ctx, `INSERT INTO schema_migrations(version) VALUES($1)`, name); e != nil {
			t.Fatal(e)
		}
	}
	_, err = db.Exec(ctx, `INSERT INTO draws(id,title,currency,price_minor,capacity,status,deadline) VALUES
 ('open','Existing sale','ETB',50000,100,'open',now()+interval '1 hour'),
 ('draft','Unopened sale','ETB',10000,100,'closed',now()+interval '1 hour'),
 ('done','Completed sale','USD',1000,100,'completed',now()-interval '1 day');
 INSERT INTO orders(id,user_id,draw_id,number,amount_minor,currency,provider,status,idempotency_key,fingerprint,phone,email,name,expires_at)
 VALUES('historic','buyer','open',42,50000,'ETB','legacy','paid','historic','historic','','','',now());`)
	if err != nil {
		t.Fatal(err)
	}
	if err = Apply(ctx, db); err != nil {
		t.Fatal(err)
	}
	if err = Apply(ctx, db); err != nil {
		t.Fatal("migration retry", err)
	}
	var intact bool
	err = db.QueryRow(ctx, `SELECT
 (SELECT count(*)=3 FROM draws) AND
 (SELECT sales_started_at IS NOT NULL AND rules IS NULL AND template_id IS NULL FROM draws WHERE id='open') AND
 (SELECT sales_started_at IS NULL FROM draws WHERE id='draft') AND
 (SELECT sales_closed_at IS NOT NULL FROM draws WHERE id='done') AND
 (SELECT number=42 AND status='paid' FROM orders WHERE id='historic')`).Scan(&intact)
	if err != nil || !intact {
		t.Fatal("historical data was changed", err)
	}
}
