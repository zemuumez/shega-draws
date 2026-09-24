package httpapi

import (
	"net"
	"net/http/httptest"
	"rimna/backend/internal/domain"
	"rimna/backend/internal/payment/chapa"
	"rimna/backend/internal/service"
	"strings"
	"testing"
)

func TestProxyAddressCannotBeSpoofed(t *testing.T) {
	_, trusted, _ := net.ParseCIDR("127.0.0.0/8")
	a := API{TrustedProxies: []*net.IPNet{trusted}}
	r := httptest.NewRequest("POST", "/v1/contact", nil)
	r.RemoteAddr = "203.0.113.1:5000"
	r.Header.Set("X-Real-IP", "192.0.2.42")
	if a.clientIP(r) != "203.0.113.1" {
		t.Fatal("untrusted forwarding header accepted")
	}
	r.RemoteAddr = "127.0.0.1:5000"
	if a.clientIP(r) != "192.0.2.42" {
		t.Fatal("trusted proxy not resolved")
	}
	r.Header.Set("X-Real-IP", "invalid")
	if a.clientIP(r) != "127.0.0.1" {
		t.Fatal("invalid proxy IP accepted")
	}
}
func TestUnauthenticatedAndForgedRequestsFailBeforeDatabase(t *testing.T) {
	a := API{Origin: "https://rimna.example", Service: &service.Service{Providers: map[string]domain.PaymentProvider{"chapa": chapa.New("", "secret", "test", []string{"ETB"})}}}
	handler := a.Handler()
	for _, tc := range []struct {
		method, path, origin, body string
		status                     int
	}{{"GET", "/v1/orders", "", "", 401}, {"GET", "/v1/admin/orders", "", "", 401}, {"POST", "/v1/webhooks/chapa", "", `{"status":"success"}`, 401}, {"GET", "/v1/draws", "https://evil.example", "", 403}, {"GET", "/v1/payment-methods?currency=ETB", "", "", 200}} {
		w := httptest.NewRecorder()
		r := httptest.NewRequest(tc.method, tc.path, strings.NewReader(tc.body))
		r.Header.Set("Origin", tc.origin)
		handler.ServeHTTP(w, r)
		if w.Code != tc.status {
			t.Errorf("%s: %d", tc.path, w.Code)
		}
	}
}
