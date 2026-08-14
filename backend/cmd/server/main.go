// main.go wires all dependencies and starts the Shega Draws API server.
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
	"github.com/shega-draws/backend/config"
	"github.com/shega-draws/backend/internal/infrastructure/postgres"
	redisinfra "github.com/shega-draws/backend/internal/infrastructure/redis"
	"github.com/shega-draws/backend/internal/infrastructure/storage"
	"github.com/shega-draws/backend/internal/usecase"
	delivery "github.com/shega-draws/backend/internal/delivery/http"
	pkgjwt "github.com/shega-draws/backend/pkg/jwt"
	"github.com/shega-draws/backend/pkg/logger"
)

func main() {
	// ── Load .env file (dev convenience — ignored if file is absent) ──
	if err := godotenv.Load(); err == nil {
		fmt.Fprintln(os.Stderr, "Loaded .env file")
	}

	// ── Load config ──
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "config error: %v\n", err)
		os.Exit(1)
	}

	// ── Init logger ──
	logger.Init(cfg.IsDevelopment())

	ctx := context.Background()

	// ── PostgreSQL ──
	pool, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to PostgreSQL")
	}
	defer pool.Close()

	// ── Redis ──
	redisClient, err := redisinfra.NewClient(cfg.RedisAddr, cfg.RedisPassword, cfg.RedisDB)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to Redis")
	}

	// ── S3 / MinIO ──
	uploader, err := storage.NewS3Uploader(
		cfg.S3Endpoint, cfg.S3AccessKey, cfg.S3SecretKey,
		cfg.S3Bucket, cfg.S3Region, cfg.S3UsePathStyle, cfg.S3PresignExpiry,
	)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to configure S3 uploader")
	}

	// ── JWT Manager ──
	jwtManager, err := pkgjwt.NewManager(
		cfg.JWTPrivateKeyPath, cfg.JWTPublicKeyPath,
		cfg.JWTAccessTokenExpiry, cfg.JWTRefreshTokenExpiry,
	)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to initialise JWT manager")
	}

	// ── Repositories ──
	userRepo  := postgres.NewUserRepository(pool)
	drawRepo  := postgres.NewDrawRepository(pool)
	entryRepo := postgres.NewEntryRepository(pool)

	// ── Token Store ──
	tokenStore := redisinfra.NewTokenStore(redisClient)

	// ── Use Cases ──
	authUC  := usecase.NewAuthUseCase(userRepo, jwtManager, tokenStore, cfg.JWTRefreshTokenExpiry)
	drawUC  := usecase.NewDrawUseCase(drawRepo, entryRepo)
	entryUC := usecase.NewEntryUseCase(entryRepo, drawRepo, uploader)

	// ── Router ──
	router := delivery.NewRouter(delivery.RouterConfig{
		AuthUC:               authUC,
		DrawUC:               drawUC,
		EntryUC:              entryUC,
		JWTManager:           jwtManager,
		RedisClient:          redisClient,
		Pool:                 pool,
		CORSOrigins:          delivery.ParseCORSOrigins(cfg.CORSAllowedOrigins),
		RateLimitGlobal:      cfg.RateLimitGlobal,
		RateLimitAuth:        cfg.RateLimitAuth,
		RateLimitEntrySubmit: cfg.RateLimitEntrySubmit,
		RefreshExpiry:        cfg.JWTRefreshTokenExpiry,
	})

	// ── HTTP Server ──
	srv := &http.Server{
		Addr:         ":" + cfg.AppPort,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// ── Graceful shutdown ──
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Info().Str("port", cfg.AppPort).Str("env", cfg.AppEnv).Msg("Shega Draws API starting")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("server failed")
		}
	}()

	<-quit
	log.Info().Msg("shutting down gracefully...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("server forced to shutdown")
	}
	log.Info().Msg("server stopped")
}
