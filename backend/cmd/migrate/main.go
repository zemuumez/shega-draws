package main

import (
	"context"
	"log"
	"os"
	dotenv "rimna/backend/internal/env"
	"rimna/backend/internal/store"
	"rimna/backend/migrations"
)

func main() {
	dotenv.Load()
	ctx := context.Background()
	s, err := store.Open(ctx, os.Getenv("DATABASE_URL"), 2)
	if err != nil {
		log.Fatal("database unavailable")
	}
	defer s.DB.Close()
	if err = migrations.Apply(ctx, s.DB); err != nil {
		log.Fatal(err)
	}
	log.Print("migrations applied")
}
