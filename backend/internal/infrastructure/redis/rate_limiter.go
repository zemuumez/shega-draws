package redis

import (
	"context"
	"fmt"
	"net/http"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

// RateLimiter implements a sliding window rate limiter backed by Redis.
type RateLimiter struct {
	client *goredis.Client
	limit  int
	window time.Duration
	prefix string
}

// NewRateLimiter constructs a RateLimiter.
func NewRateLimiter(client *goredis.Client, limit int, window time.Duration, prefix string) *RateLimiter {
	return &RateLimiter{client: client, limit: limit, window: window, prefix: prefix}
}

// Middleware returns an http.Handler middleware that applies rate limiting per IP.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := realIP(r)
		key := fmt.Sprintf("rl:%s:%s", rl.prefix, ip)

		ctx := r.Context()
		count, err := rl.increment(ctx, key)
		if err != nil {
			// Fail open — don't block traffic on Redis errors
			next.ServeHTTP(w, r)
			return
		}

		w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", rl.limit))
		w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", max(0, rl.limit-count)))

		if count > rl.limit {
			w.Header().Set("Retry-After", fmt.Sprintf("%.0f", rl.window.Seconds()))
			http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// increment atomically increments the counter and sets TTL on first request.
func (rl *RateLimiter) increment(ctx context.Context, key string) (int, error) {
	pipe := rl.client.Pipeline()
	incr := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, rl.window)
	if _, err := pipe.Exec(ctx); err != nil {
		return 0, err
	}
	return int(incr.Val()), nil
}

// realIP extracts the client IP respecting common proxy headers.
func realIP(r *http.Request) string {
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	return r.RemoteAddr
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
