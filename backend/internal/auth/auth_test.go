package auth

import (
	"context"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestJWTVerification(t *testing.T) {
	pub, priv, _ := ed25519.GenerateKey(rand.Reader)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]any{"keys": []any{map[string]string{"kid": "one", "kty": "OKP", "crv": "Ed25519", "alg": "EdDSA", "x": base64.RawURLEncoding.EncodeToString(pub)}}})
	}))
	defer srv.Close()
	v := &Verifier{URL: srv.URL, Issuer: "https://rimna.test", Audience: "rimna-api"}
	token := func(issuer string, expiration time.Time) string {
		c := Claims{RegisteredClaims: jwt.RegisteredClaims{Issuer: issuer, Audience: jwt.ClaimStrings{"rimna-api"}, Subject: "u", IssuedAt: jwt.NewNumericDate(time.Now()), ExpiresAt: jwt.NewNumericDate(expiration)}, Verified: true, SessionID: "s"}
		tok := jwt.NewWithClaims(jwt.SigningMethodEdDSA, c)
		tok.Header["kid"] = "one"
		s, _ := tok.SignedString(priv)
		return s
	}
	if _, err := v.Verify(context.Background(), token(v.Issuer, time.Now().Add(3*time.Minute))); err != nil {
		t.Fatal(err)
	}
	for _, raw := range []string{token("attacker", time.Now().Add(time.Minute)), token(v.Issuer, time.Now().Add(-time.Minute)), token(v.Issuer, time.Now().Add(time.Hour)), "garbage"} {
		if _, err := v.Verify(context.Background(), raw); err == nil {
			t.Fatal("accepted invalid JWT")
		}
	}
}
