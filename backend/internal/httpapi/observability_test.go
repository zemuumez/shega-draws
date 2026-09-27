package httpapi

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestMetricsRequireSecret(t *testing.T) {
	a := API{MetricsToken: strings.Repeat("x", 32)}
	w := httptest.NewRecorder()
	a.serveMetrics(w, httptest.NewRequest("GET", "/metrics", nil))
	if w.Code != 401 {
		t.Fatal(w.Code)
	}
}
func TestMetricsUseRouteNotPlayerPath(t *testing.T) {
	a := API{}
	a.metrics.samples = map[string]*sample{}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /orders/{id}", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) })
	r := httptest.NewRequest("GET", "/orders/private-player-id?token=secret", nil)
	a.observe(httptest.NewRecorder(), r, mux)
	for k := range a.metrics.samples {
		if strings.Contains(k, "private-player") || strings.Contains(k, "secret") || !strings.Contains(k, "/orders/{id}") {
			t.Fatal(k)
		}
	}
}
