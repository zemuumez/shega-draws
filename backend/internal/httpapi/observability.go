package httpapi

import (
	"context"
	"crypto/subtle"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type sample struct {
	Count   int
	Seconds float64
	Buckets [7]int
}
type metrics struct {
	mu      sync.Mutex
	samples map[string]*sample
}

var bounds = [...]float64{.01, .05, .1, .5, 1, 5, 20}

type responseStatus struct {
	http.ResponseWriter
	status int
}

func (w *responseStatus) WriteHeader(s int) {
	if w.status == 0 {
		w.status = s
		w.ResponseWriter.WriteHeader(s)
	}
}
func (w *responseStatus) Write(b []byte) (int, error) {
	if w.status == 0 {
		w.WriteHeader(200)
	}
	return w.ResponseWriter.Write(b)
}
func (w *responseStatus) Unwrap() http.ResponseWriter { return w.ResponseWriter }
func routeLabel(pattern string) string {
	if pattern == "" {
		return "unmatched"
	}
	return pattern
}
func (a *API) observe(w http.ResponseWriter, r *http.Request, next http.Handler) {
	start := time.Now()
	rw := &responseStatus{ResponseWriter: w}
	defer func() {
		status := rw.status
		if status == 0 {
			status = 200
		}
		route := routeLabel(r.Pattern)
		elapsed := time.Since(start).Seconds()
		key := fmt.Sprintf("route=%q,status=%q", route, strconv.Itoa(status))
		a.metrics.mu.Lock()
		s := a.metrics.samples[key]
		if s == nil {
			s = &sample{}
			a.metrics.samples[key] = s
		}
		s.Count++
		s.Seconds += elapsed
		for i, b := range bounds {
			if elapsed <= b {
				s.Buckets[i]++
			}
		}
		a.metrics.mu.Unlock()
		// No query strings, authorization headers, request bodies, IPs or player IDs.
		slog.Info("http request", "request_id", w.Header().Get("X-Request-ID"), "route", route, "status", status, "duration_ms", time.Since(start).Milliseconds())
	}()
	next.ServeHTTP(rw, r)
}
func (a *API) serveMetrics(w http.ResponseWriter, r *http.Request) {
	supplied := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	if !strings.HasPrefix(r.Header.Get("Authorization"), "Bearer ") || len(a.MetricsToken) < 32 || subtle.ConstantTimeCompare([]byte(supplied), []byte(a.MetricsToken)) != 1 {
		http.Error(w, "Not authorized", 401)
		return
	}
	w.Header().Set("Content-Type", "text/plain; version=0.0.4")
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	o, err := a.Store.Operations(ctx)
	if err != nil {
		http.Error(w, "Metrics unavailable", 503)
		return
	}
	fmt.Fprintln(w, "# TYPE rimna_http_requests_total counter\n# TYPE rimna_http_request_duration_seconds histogram")
	a.metrics.mu.Lock()
	for key, s := range a.metrics.samples {
		fmt.Fprintf(w, "rimna_http_requests_total{%s} %d\nrimna_http_request_duration_seconds_sum{%s} %g\nrimna_http_request_duration_seconds_count{%s} %d\n", key, s.Count, key, s.Seconds, key, s.Count)
		for i, b := range bounds {
			fmt.Fprintf(w, "rimna_http_request_duration_seconds_bucket{%s,le=%q} %d\n", key, strconv.FormatFloat(b, 'g', -1, 64), s.Buckets[i])
		}
		fmt.Fprintf(w, "rimna_http_request_duration_seconds_bucket{%s,le=\"+Inf\"} %d\n", key, s.Count)
	}
	a.metrics.mu.Unlock()
	paused := 0
	if o.SalesPaused || o.RecoveryLocked {
		paused = 1
	}
	seen := int64(0)
	if o.WorkerLastSeen != nil {
		seen = o.WorkerLastSeen.Unix()
	}
	last := int64(0)
	failures := 0
	for _, b := range o.Backups {
		if b.Status == "succeeded" && b.FinishedAt != nil && b.FinishedAt.Unix() > last {
			last = b.FinishedAt.Unix()
		}
		if b.Status == "failed" {
			failures++
		}
	}
	stat := a.Store.DB.Stat()
	fmt.Fprintf(w, "rimna_sales_paused %d\nrimna_pending_payments %d\nrimna_refund_required %d\nrimna_worker_last_seen_seconds %d\nrimna_backup_last_success_seconds %d\nrimna_backup_recent_failures %d\nrimna_db_connections_acquired %d\nrimna_db_connections_max %d\n", paused, o.PendingPayments, o.RefundRequired, seen, last, failures, stat.AcquiredConns(), stat.MaxConns())
}
