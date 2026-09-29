// Staff grants require local operator access; public registration never grants roles.
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	dotenv "rimna/backend/internal/env"
	"rimna/backend/internal/store"
)

func main() {
	dotenv.Load()
	email := flag.String("email", "", "Verified staff account email")
	role := flag.String("role", "reviewer", "admin or reviewer")
	revoke := flag.Bool("revoke", false, "Revoke staff access")
	flag.Parse()
	if *email == "" || (*role != "admin" && *role != "reviewer") {
		log.Fatal("email and valid role required")
	}
	ctx := context.Background()
	s, err := store.Open(ctx, os.Getenv("DATABASE_URL"), 2)
	if err != nil {
		log.Fatal("database unavailable")
	}
	defer s.DB.Close()
	var id string
	err = s.DB.QueryRow(ctx, `SELECT id FROM auth."user" WHERE lower(email)=lower($1) AND ($2 OR ("emailVerified" AND "twoFactorEnabled"))`, *email, *revoke).Scan(&id)
	if err != nil {
		log.Fatal("verified account with two-factor authentication required")
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		log.Fatal("database unavailable")
	}
	defer tx.Rollback(ctx)
	_, err = tx.Exec(ctx, `INSERT INTO staff(user_id,role,enabled) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET role=EXCLUDED.role,enabled=EXCLUDED.enabled`, id, *role, !*revoke)
	if err != nil {
		log.Fatal("grant failed")
	}
	_, err = tx.Exec(ctx, `INSERT INTO audit_log(actor,action,resource) VALUES('operator','staff.grant',$1)`, id)
	if err != nil {
		log.Fatal("audit failed")
	}
	if err = tx.Commit(ctx); err != nil {
		log.Fatal("commit failed")
	}
	fmt.Println("Staff access updated")
}
