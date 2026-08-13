// Package middleware contains reusable HTTP middleware for the Shega Draws API.
package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/shega-draws/backend/internal/domain"
	pkgjwt "github.com/shega-draws/backend/pkg/jwt"
)

// contextKey is a private type to avoid context key collisions.
type contextKey string

const (
	ContextKeyClaims contextKey = "jwt_claims"
)

// ClaimsFromContext extracts JWT claims from the request context.
func ClaimsFromContext(ctx context.Context) (*pkgjwt.Claims, bool) {
	claims, ok := ctx.Value(ContextKeyClaims).(*pkgjwt.Claims)
	return claims, ok
}

// Authenticate validates the Bearer token and injects claims into context.
// Routes that require authentication must be wrapped with this middleware first.
func Authenticate(jwtManager *pkgjwt.Manager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				respondUnauthorized(w, "missing or malformed Authorization header")
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := jwtManager.ValidateAccessToken(tokenStr)
			if err != nil {
				if err == domain.ErrTokenExpired {
					respondUnauthorized(w, "token expired")
					return
				}
				respondUnauthorized(w, "invalid token")
				return
			}

			ctx := context.WithValue(r.Context(), ContextKeyClaims, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole creates a middleware that enforces a minimum role level.
// Must be used AFTER Authenticate.
func RequireRole(minRole domain.Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := ClaimsFromContext(r.Context())
			if !ok {
				respondUnauthorized(w, "unauthenticated")
				return
			}
			if !claims.Role.AtLeast(minRole) {
				http.Error(w, `{"error":"forbidden: insufficient permissions"}`, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func respondUnauthorized(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	w.Write([]byte(`{"error":"` + message + `"}`)) //nolint:errcheck
}
