package middleware

import (
	"net/http"
	"time"

	"github.com/go-chi/cors"
	"github.com/rs/zerolog/log"
)

// CORS returns a Chi-compatible CORS middleware configured for the frontend origin.
func CORS(allowedOrigins []string) func(http.Handler) http.Handler {
	return cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposedHeaders:   []string{"X-RateLimit-Limit", "X-RateLimit-Remaining"},
		AllowCredentials: true, // Required for httpOnly refresh token cookie
		MaxAge:           300,
	})
}

// Logger logs each request with method, path, status, latency, and request ID.
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := &responseWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(ww, r)

		log.Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Int("status", ww.status).
			Dur("latency_ms", time.Since(start)).
			Str("ip", r.RemoteAddr). // Chi's RealIP middleware already sets RemoteAddr correctly
			Str("request_id", r.Header.Get("X-Request-ID")).
			Msg("request")
	})
}

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(status int) {
	rw.status = status
	rw.ResponseWriter.WriteHeader(status)
}
