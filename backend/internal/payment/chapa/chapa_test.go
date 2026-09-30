package chapa

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"rimna/backend/internal/domain"
	"testing"
)

func TestMoney(t *testing.T) {
	for raw, want := range map[string]int64{`"25"`: 2500, `100.01`: 10001, `"0.1"`: 10} {
		got, err := DecimalMinor(raw)
		if err != nil || got != want {
			t.Fatalf("%s: %d %v", raw, got, err)
		}
	}
	for _, raw := range []string{"-1", "1e4", "1.001", "NaN", "1.", "", "9999999999999999999999"} {
		if _, err := DecimalMinor(raw); err == nil {
			t.Fatalf("accepted %s", raw)
		}
	}
}
func TestSignature(t *testing.T) {
	a := New("test", "webhook-test-secret", "test", []string{"ETB"})
	body := []byte(`{"webhook_type":"payment","mode":"test","merchant_reference":"order1","chapa_reference":"ref1"}`)
	mac := hmac.New(sha256.New, []byte(a.WebhookSecret))
	mac.Write(body)
	sig := hex.EncodeToString(mac.Sum(nil))
	if !a.AuthenticateWebhook(body, sig) || a.AuthenticateWebhook(append(body, ' '), sig) || a.AuthenticateWebhook(body, "") {
		t.Fatal("signature check")
	}
	if ref, err := a.WebhookReference(body); err != nil || ref.MerchantReference != "order1" || ref.ProviderReference != "ref1" {
		t.Fatal(ref, err)
	}
}
func TestHostedCheckoutAndVerification(t *testing.T) {
	count := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Error("missing auth")
		}
		switch r.URL.Path {
		case "/payments/hosted", "/transaction/initialize":
			count++
			var body map[string]any
			json.NewDecoder(r.Body).Decode(&body)
			if (body["merchant_reference"] != "order1" && body["tx_ref"] != "order1") || (body["amount"] != 25.01 && body["amount"] != "25.01") {
				t.Errorf("wrong checkout: %v", body)
			}
			w.Write([]byte(`{"status":"success","data":{"checkout_url":"https://checkout.chapa.co/checkout/payment/example","chapa_reference":"ref1"}}`))
		case "/payments/ref1/verify", "/transaction/verify/ref1":
			w.Write([]byte(`{"status":"success","data":{"status":"success","amount":"25.01","currency":"ETB","merchant_reference":"order1","tx_ref":"order1","chapa_reference":"ref1"}}`))
		default:
			t.Error(r.URL.Path)
		}
	}))
	defer server.Close()
	a := New("test-key", "secret", "test", []string{"ETB"})
	a.BaseURL = server.URL
	o := domain.CheckoutRequest{ID: "order1", AmountMinor: 2501, Currency: "ETB", Name: "Example Player"}
	checkout, err := a.Start(context.Background(), o)
	if err != nil || checkout.URL == "" || count != 1 {
		t.Fatal(checkout, err)
	}
	v, err := a.Verify(context.Background(), "ref1")
	if err != nil || v.AmountMinor != 2501 || v.Reference != "ref1" {
		t.Fatal(v, err)
	}
}
func TestCheckoutRejectsUntrustedRedirect(t *testing.T) {
	s := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"success","data":{"checkout_url":"https://checkout.chapa.global.evil.test/pay"}}`))
	}))
	defer s.Close()
	a := New("test", "secret", "test", []string{"ETB"})
	a.BaseURL = s.URL
	if _, err := a.Start(context.Background(), domain.CheckoutRequest{Currency: "ETB"}); err == nil {
		t.Fatal("accepted attacker URL")
	}
}

func TestSandboxMockCheckoutAndVerification(t *testing.T) {
	a := New("CHASECK_TEST-demo", "webhook-test-secret", "test", []string{"ETB"}, "http://localhost:3000")
	o := domain.CheckoutRequest{ID: "dep_sandbox_1", AmountMinor: 5000, Currency: "ETB", Name: "Demo User"}
	checkout, err := a.Start(context.Background(), o)
	if err != nil {
		t.Fatalf("unexpected Start error: %v", err)
	}
	if checkout.Reference != "chapa_mock_dep_sandbox_1_amt_5000" {
		t.Fatalf("unexpected reference: %s", checkout.Reference)
	}
	expectedURL := "http://localhost:3000/chapa-sandbox?id=dep_sandbox_1&amount=5000&currency=ETB&ref=chapa_mock_dep_sandbox_1_amt_5000"
	if checkout.URL != expectedURL {
		t.Fatalf("expected URL %s, got %s", expectedURL, checkout.URL)
	}
	v, err := a.Verify(context.Background(), checkout.Reference)
	if err != nil {
		t.Fatalf("unexpected Verify error: %v", err)
	}
	if v.Status != "success" || v.AmountMinor != 5000 || v.Currency != "ETB" || v.MerchantReference != "dep_sandbox_1" {
		t.Fatalf("unexpected verification: %+v", v)
	}
}

