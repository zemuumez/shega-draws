// Package http wires the Chi router, middleware stack, and all route handlers.
package http

import (
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	goredis "github.com/redis/go-redis/v9"
	"github.com/shega-draws/backend/internal/delivery/http/handler"
	"github.com/shega-draws/backend/internal/delivery/http/middleware"
	redisinfra "github.com/shega-draws/backend/internal/infrastructure/redis"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/usecase"
	pkgjwt "github.com/shega-draws/backend/pkg/jwt"
)

// RouterConfig holds all handler dependencies for building the router.
type RouterConfig struct {
	AuthUC               *usecase.AuthUseCase
	DrawUC               *usecase.DrawUseCase
	EntryUC              *usecase.EntryUseCase
	JWTManager           *pkgjwt.Manager
	RedisClient          *goredis.Client
	Pool                 *pgxpool.Pool
	CORSOrigins          []string
	RateLimitGlobal      int
	RateLimitAuth        int
	RateLimitEntrySubmit int
	RefreshExpiry        time.Duration
}

// NewRouter assembles the full Chi router with all middleware and routes.
func NewRouter(cfg RouterConfig) http.Handler {
	r := chi.NewRouter()

	// ── Global middleware stack ──
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.CORS(cfg.CORSOrigins))
	r.Use(chimiddleware.Recoverer)

	// Global rate limiter
	globalRL := redisinfra.NewRateLimiter(cfg.RedisClient, cfg.RateLimitGlobal, time.Minute, "global")
	r.Use(globalRL.Middleware)

	// ── Handler construction ──
	authH   := handler.NewAuthHandler(cfg.AuthUC, cfg.RefreshExpiry)
	drawH   := handler.NewDrawHandler(cfg.DrawUC)
	entryH  := handler.NewEntryHandler(cfg.EntryUC)
	healthH := handler.NewHealthHandler(cfg.Pool, cfg.RedisClient)

	// ── Route-specific rate limiters ──
	authRL  := redisinfra.NewRateLimiter(cfg.RedisClient, cfg.RateLimitAuth, 15*time.Minute, "auth")
	entryRL := redisinfra.NewRateLimiter(cfg.RedisClient, cfg.RateLimitEntrySubmit, 10*time.Minute, "entry_submit")

	// ── Auth middleware ──
	authenticate     := middleware.Authenticate(cfg.JWTManager)
	requirePlayer    := middleware.RequireRole(domain.RolePlayer)
	requireAdmin     := middleware.RequireRole(domain.RoleAdmin)
	requireSuperAdmin := middleware.RequireRole(domain.RoleSuperAdmin)

	// ── Health ──
	r.Get("/health",       healthH.Liveness)
	r.Get("/health/ready", healthH.Readiness)

	// ── API v1 ──
	r.Route("/api/v1", func(r chi.Router) {

		// Auth
		r.Route("/auth", func(r chi.Router) {
			r.With(authRL.Middleware).Post("/register", authH.RegisterPlayer)
			r.With(authRL.Middleware).Post("/login", authH.LoginAdmin)
			r.Post("/refresh", authH.Refresh)
			r.With(authenticate).Post("/logout", authH.Logout)
			r.With(authenticate).Get("/me", authH.Me)
		})

		// Draws
		r.Route("/draws", func(r chi.Router) {
			r.Get("/", drawH.ListDraws)          // Public — list all draws
			r.Get("/active", drawH.GetActiveDraw) // Public — current active draw

			r.Group(func(r chi.Router) {
				r.Use(authenticate)
				r.With(requireSuperAdmin).Post("/", drawH.CreateDraw)
				r.With(requireAdmin).Post("/{drawID}/close", drawH.CloseEntries)
				r.With(requireAdmin).Post("/{drawID}/reveal", drawH.RevealDraw)
			})
		})

		// Entries
		r.Route("/entries", func(r chi.Router) {
			r.Use(authenticate)
			r.With(requirePlayer, entryRL.Middleware).Post("/", entryH.SubmitEntry)
			r.With(requirePlayer).Get("/mine", entryH.GetMyEntries)
			r.With(requireAdmin).Get("/", entryH.ListEntries)
			r.With(requireAdmin).Post("/{entryID}/confirm", entryH.ConfirmEntry)
			r.With(requireAdmin).Post("/{entryID}/reject", entryH.RejectEntry)
		})
	})

	return r
}

// ParseCORSOrigins splits a comma-separated origins string.
func ParseCORSOrigins(origins string) []string {
	parts := strings.Split(origins, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			result = append(result, p)
		}
	}
	return result
}
