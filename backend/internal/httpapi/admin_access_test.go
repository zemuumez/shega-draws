package httpapi

import (
	"net/http/httptest"
	"testing"
)

func TestAdminNewEndpointsRequireAuthentication(t *testing.T) {
	a := API{Origin: "https://example.test"}
	for _, path := range []string{"session", "users", "overview"} {
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest("GET", "/v1/admin/"+path, nil))
		if w.Code != 401 {
			t.Fatalf("%s allowed unauthenticated access: %d", path, w.Code)
		}
	}
}

func TestAdminPermissionBoundary(t *testing.T) {
	for _, tc := range []struct {
		role, method, kind string
		allowed            bool
	}{
		{"reviewer", "GET", "session", true}, {"reviewer", "GET", "orders", true},
		{"reviewer", "GET", "users", false}, {"reviewer", "GET", "operations", false},
		{"reviewer", "GET", "audit", false}, {"reviewer", "PUT", "draws", false},
		{"admin", "GET", "users", true}, {"admin", "GET", "overview", true},
		{"admin", "PUT", "operations", true}, {"admin", "PUT", "users", false},
		{"admin", "GET", "passwords", false}, {"player", "GET", "orders", false},
		{"super_admin", "PUT", "draws", false}, {"admin", "DELETE", "draws", false},
	} {
		if got := adminAllowed(tc.role, tc.method, tc.kind); got != tc.allowed {
			t.Errorf("%s %s %s: got %v", tc.role, tc.method, tc.kind, got)
		}
	}
}
