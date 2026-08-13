package handler

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	goredis "github.com/redis/go-redis/v9"
)

// HealthHandler provides liveness and readiness endpoints.
type HealthHandler struct {
	pool        *pgxpool.Pool
	redisClient *goredis.Client
}

// NewHealthHandler constructs a HealthHandler.
func NewHealthHandler(pool *pgxpool.Pool, redisClient *goredis.Client) *HealthHandler {
	return &HealthHandler{pool: pool, redisClient: redisClient}
}

// Liveness handles GET /health — always returns 200 if the process is running.
func (h *HealthHandler) Liveness(w http.ResponseWriter, r *http.Request) {
	respond(w, http.StatusOK, map[string]string{"status": "ok"})
}

// Readiness handles GET /health/ready — checks DB + Redis connectivity.
func (h *HealthHandler) Readiness(w http.ResponseWriter, r *http.Request) {
	checks := map[string]string{}
	allOK := true

	if err := h.pool.Ping(r.Context()); err != nil {
		checks["postgres"] = "unhealthy: " + err.Error()
		allOK = false
	} else {
		checks["postgres"] = "ok"
	}

	if err := h.redisClient.Ping(r.Context()).Err(); err != nil {
		checks["redis"] = "unhealthy: " + err.Error()
		allOK = false
	} else {
		checks["redis"] = "ok"
	}

	status := http.StatusOK
	if !allOK {
		status = http.StatusServiceUnavailable
	}
	respond(w, status, map[string]interface{}{"status": map[string]bool{"ok": allOK}, "checks": checks})
}
