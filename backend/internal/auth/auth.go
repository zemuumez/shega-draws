// Package auth verifies Better Auth's short-lived Ed25519 JWTs using its public JWKS.
package auth

import (
	"context"
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"io"
	"net/http"
	"rimna/backend/internal/domain"
	"sync"
	"time"
)

type Verifier struct {
	URL, Issuer, Audience string
	Client                *http.Client
	mu                    sync.Mutex
	keys                  map[string]ed25519.PublicKey
	loaded                time.Time
}
type Claims struct {
	jwt.RegisteredClaims
	Email     string `json:"email"`
	Name      string `json:"name"`
	Verified  bool   `json:"emailVerified"`
	SessionID string `json:"sessionId"`
}

func (v *Verifier) key(ctx context.Context, kid string) (ed25519.PublicKey, error) {
	v.mu.Lock()
	defer v.mu.Unlock()
	if time.Since(v.loaded) < 5*time.Minute {
		if k, ok := v.keys[kid]; ok {
			return k, nil
		}
		if time.Since(v.loaded) < 30*time.Second {
			return nil, errors.New("unknown key")
		}
	}
	req, err := http.NewRequestWithContext(ctx, "GET", v.URL, nil)
	if err != nil {
		return nil, err
	}
	c := v.Client
	if c == nil {
		c = &http.Client{Timeout: 5 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	}
	r, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	defer r.Body.Close()
	if r.StatusCode != 200 {
		return nil, errors.New("identity provider unavailable")
	}
	var set struct {
		Keys []struct{ Kid, Kty, Crv, Alg, X string }
	}
	if err = json.NewDecoder(io.LimitReader(r.Body, 65536)).Decode(&set); err != nil {
		return nil, err
	}
	keys := map[string]ed25519.PublicKey{}
	for _, j := range set.Keys {
		if j.Kty != "OKP" || j.Crv != "Ed25519" || (j.Alg != "" && j.Alg != "EdDSA") {
			continue
		}
		b, e := base64.RawURLEncoding.DecodeString(j.X)
		if e == nil && len(b) == ed25519.PublicKeySize {
			keys[j.Kid] = ed25519.PublicKey(b)
		}
	}
	v.keys = keys
	v.loaded = time.Now()
	k, ok := keys[kid]
	if !ok {
		return nil, errors.New("unknown key")
	}
	return k, nil
}
func (v *Verifier) Verify(ctx context.Context, raw string) (domain.User, error) {
	claims := &Claims{}
	_, err := jwt.ParseWithClaims(raw, claims, func(t *jwt.Token) (any, error) {
		kid, _ := t.Header["kid"].(string)
		if kid == "" {
			return nil, errors.New("missing key")
		}
		return v.key(ctx, kid)
	}, jwt.WithValidMethods([]string{"EdDSA"}), jwt.WithIssuer(v.Issuer), jwt.WithAudience(v.Audience), jwt.WithExpirationRequired(), jwt.WithIssuedAt(), jwt.WithLeeway(5*time.Second))
	if err != nil {
		return domain.User{}, err
	}
	if claims.Subject == "" || claims.SessionID == "" || claims.IssuedAt == nil || claims.ExpiresAt.Sub(claims.IssuedAt.Time) > 5*time.Minute {
		return domain.User{}, errors.New("invalid identity")
	}
	return domain.User{ID: claims.Subject, Name: claims.Name, Email: claims.Email, Verified: claims.Verified, SessionID: claims.SessionID}, nil
}
