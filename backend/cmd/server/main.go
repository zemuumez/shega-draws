package main

import (
	"context"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"rimna/backend/internal/auth"
	"rimna/backend/internal/domain"
	dotenv "rimna/backend/internal/env"
	"rimna/backend/internal/httpapi"
	"rimna/backend/internal/payment/chapa"
	"rimna/backend/internal/payment/stripe"
	"rimna/backend/internal/service"
	"rimna/backend/internal/store"
	"strconv"
	"strings"
	"syscall"
	"time"
)

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func main() {
	dotenv.Load()
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()
	origin := env("WEB_ORIGIN", "http://localhost:3000")
	issuer := env("AUTH_ISSUER", origin)
	jwks := env("AUTH_JWKS_URL", issuer+"/api/auth/jwks")
	mode := env("CHAPA_MODE", "test")
	key := os.Getenv("CHAPA_SECRET_KEY")
	if mode != "test" && mode != "live" {
		slog.Error("invalid CHAPA_MODE")
		os.Exit(1)
	}
	if key != "" {
		valid := false
		if mode == "test" {
			valid = strings.HasPrefix(key, "CHASECK_TEST-") || strings.HasPrefix(key, "CHAPA_TEST_") || strings.Contains(strings.ToUpper(key), "DEMO") || strings.Contains(strings.ToUpper(key), "MOCK")
		} else {
			valid = strings.HasPrefix(key, "CHASECK-") || strings.HasPrefix(key, "CHAPA_LIVE_")
		}
		if !valid {
			slog.Error("Chapa key does not match configured mode (test keys must start with CHASECK_TEST- or contain DEMO)")
			os.Exit(1)
		}
	}
	if env("APP_ENV", "development") == "production" {
		for _, s := range []string{origin, issuer, jwks} {
			u, err := url.Parse(s)
			if err != nil || u.Scheme != "https" || u.Host == "" {
				slog.Error("production URLs require HTTPS")
				os.Exit(1)
			}
		}
	}
	max, _ := strconv.Atoi(env("DB_MAX_CONNECTIONS", "20"))
	if max < 2 || max > 200 {
		slog.Error("invalid DB_MAX_CONNECTIONS")
		os.Exit(1)
	}
	st, err := store.Open(ctx, os.Getenv("DATABASE_URL"), int32(max))
	if err != nil {
		slog.Error("database unavailable", "error", err)
		os.Exit(1)
	}
	defer st.DB.Close()
	if err = st.EnsureMode(ctx, mode); err != nil {
		slog.Error("database payment environment mismatch or migrations missing")
		os.Exit(1)
	}
	providers := map[string]domain.PaymentProvider{"chapa": chapa.New(key, os.Getenv("CHAPA_WEBHOOK_SECRET"), mode, strings.Split(env("CHAPA_CURRENCIES", "ETB"), ","), origin)}
	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	stripeSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if stripeKey != "" && stripeSecret != "" {
		stripeProvider := stripe.New(stripeKey, stripeSecret, origin+"/account")
		providers["stripe"] = stripeProvider
	}
	svc := &service.Service{Store: st, Providers: providers, Mode: mode}
	enabled := env("DEPOSITS_ENABLED", "false") == "true"
	min, errMin := strconv.ParseInt(env("DEPOSIT_MIN_MINOR", "0"), 10, 64)
	maxDeposit, errMax := strconv.ParseInt(env("DEPOSIT_MAX_MINOR", "0"), 10, 64)
	quota, errQuota := strconv.Atoi(env("PAYMENT_VERIFY_PER_MINUTE", "60"))
	if errQuota != nil || quota < 1 || quota > 10000 || (enabled && (errMin != nil || errMax != nil || min < 1 || maxDeposit < min || maxDeposit > 100000000)) {
		slog.Error("invalid deposit limits or verification quota")
		os.Exit(1)
	}
	if enabled && mode == "live" {
		slog.Error("live wallet deposits are not released; use test mode until wallet purchase and launch acceptance are complete")
		os.Exit(1)
	}
	svc.Wallet = st
	svc.Deposits = service.DepositPolicy{Enabled: enabled, Currency: "ETB", MinMinor: min, MaxMinor: maxDeposit}
	svc.DepositPolicies = map[string]service.DepositPolicy{
		"ETB": {Enabled: enabled, Currency: "ETB", MinMinor: min, MaxMinor: maxDeposit},
		"USD": {Enabled: enabled && stripeKey != "", Currency: "USD", MinMinor: min, MaxMinor: maxDeposit},
	}
	svc.VerificationPerMinute = quota
	role := env("PROCESS_ROLE", "all")
	if role != "all" && role != "api" && role != "worker" {
		slog.Error("invalid PROCESS_ROLE")
		os.Exit(1)
	}
	if role == "worker" {
		svc.RunWorker(ctx)
		return
	}
	if role == "all" {
		go svc.RunWorker(ctx)
	}
	var trusted []*net.IPNet
	for _, cidr := range strings.Split(os.Getenv("TRUSTED_PROXY_CIDRS"), ",") {
		if strings.TrimSpace(cidr) == "" {
			continue
		}
		_, network, e := net.ParseCIDR(strings.TrimSpace(cidr))
		if e != nil {
			slog.Error("invalid trusted proxy CIDR")
			os.Exit(1)
		}
		trusted = append(trusted, network)
	}
	metricsToken := os.Getenv("METRICS_TOKEN")
	if file := os.Getenv("METRICS_TOKEN_FILE"); file != "" {
		data, err := os.ReadFile(file)
		if err != nil {
			slog.Error("metrics secret file unavailable")
			os.Exit(1)
		}
		metricsToken = strings.TrimSpace(string(data))
	}
	if metricsToken != "" && len(metricsToken) < 32 {
		slog.Error("metrics token must contain at least 32 characters")
		os.Exit(1)
	}
	a := &httpapi.API{MetricsToken: metricsToken, TrustedProxies: trusted, Store: st, Service: svc, Auth: &auth.Verifier{URL: jwks, Issuer: issuer, Audience: env("AUTH_AUDIENCE", "rimna-api")}, Origin: origin, MediaDir: env("MEDIA_DIR", "./private-media")}
	srv := &http.Server{Addr: env("LISTEN_ADDR", ":8080"), Handler: a.Handler(), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 25 * time.Second, WriteTimeout: 30 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 16 << 10}
	go func() {
		<-ctx.Done()
		c, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		srv.Shutdown(c)
	}()
	slog.Info("backend ready", "role", role, "paymentsConfigured", key != "")
	if err = srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("server stopped")
		os.Exit(1)
	}
}
