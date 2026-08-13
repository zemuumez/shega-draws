// Package jwt provides RS256 JWT token issuance and validation helpers.
package jwt

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"os"
	"time"

	gojwt "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/shega-draws/backend/internal/domain"
)

// Claims is the payload embedded in every access token.
type Claims struct {
	UserID string      `json:"sub"`
	Role   domain.Role `json:"role"`
	gojwt.RegisteredClaims
}

// RefreshClaims is the payload in refresh tokens (minimal surface area).
type RefreshClaims struct {
	UserID  string `json:"sub"`
	TokenID string `json:"jti"` // Used for revocation
	gojwt.RegisteredClaims
}

// Manager handles JWT operations with RS256 keys.
type Manager struct {
	privateKey          *rsa.PrivateKey
	publicKey           *rsa.PublicKey
	accessTokenExpiry   time.Duration
	refreshTokenExpiry  time.Duration
}

// NewManager initialises a JWT Manager from PEM key files.
func NewManager(privatePath, publicPath string, accessExpiry, refreshExpiry time.Duration) (*Manager, error) {
	privBytes, err := os.ReadFile(privatePath)
	if err != nil {
		return nil, fmt.Errorf("reading private key: %w", err)
	}
	privKey, err := gojwt.ParseRSAPrivateKeyFromPEM(privBytes)
	if err != nil {
		return nil, fmt.Errorf("parsing private key: %w", err)
	}

	pubBytes, err := os.ReadFile(publicPath)
	if err != nil {
		return nil, fmt.Errorf("reading public key: %w", err)
	}
	pubKey, err := gojwt.ParseRSAPublicKeyFromPEM(pubBytes)
	if err != nil {
		return nil, fmt.Errorf("parsing public key: %w", err)
	}

	return &Manager{
		privateKey:         privKey,
		publicKey:          pubKey,
		accessTokenExpiry:  accessExpiry,
		refreshTokenExpiry: refreshExpiry,
	}, nil
}

// IssueAccessToken creates a short-lived access token for the given user.
func (m *Manager) IssueAccessToken(userID uuid.UUID, role domain.Role) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID.String(),
		Role:   role,
		RegisteredClaims: gojwt.RegisteredClaims{
			IssuedAt:  gojwt.NewNumericDate(now),
			ExpiresAt: gojwt.NewNumericDate(now.Add(m.accessTokenExpiry)),
			Issuer:    "shega-draws",
		},
	}
	token := gojwt.NewWithClaims(gojwt.SigningMethodRS256, claims)
	return token.SignedString(m.privateKey)
}

// IssueRefreshToken creates a long-lived refresh token with a unique JTI for revocation.
func (m *Manager) IssueRefreshToken(userID uuid.UUID) (string, string, error) {
	tokenID := uuid.New().String()
	now := time.Now()
	claims := RefreshClaims{
		UserID:  userID.String(),
		TokenID: tokenID,
		RegisteredClaims: gojwt.RegisteredClaims{
			IssuedAt:  gojwt.NewNumericDate(now),
			ExpiresAt: gojwt.NewNumericDate(now.Add(m.refreshTokenExpiry)),
			Issuer:    "shega-draws",
		},
	}
	token := gojwt.NewWithClaims(gojwt.SigningMethodRS256, claims)
	signed, err := token.SignedString(m.privateKey)
	return signed, tokenID, err
}

// ValidateAccessToken parses and validates an access token, returning Claims on success.
func (m *Manager) ValidateAccessToken(tokenStr string) (*Claims, error) {
	token, err := gojwt.ParseWithClaims(tokenStr, &Claims{}, func(t *gojwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*gojwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return m.publicKey, nil
	})
	if err != nil {
		if errors.Is(err, gojwt.ErrTokenExpired) {
			return nil, domain.ErrTokenExpired
		}
		return nil, domain.ErrTokenInvalid
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, domain.ErrTokenInvalid
	}
	return claims, nil
}

// ValidateRefreshToken parses a refresh token and returns its claims.
func (m *Manager) ValidateRefreshToken(tokenStr string) (*RefreshClaims, error) {
	token, err := gojwt.ParseWithClaims(tokenStr, &RefreshClaims{}, func(t *gojwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*gojwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return m.publicKey, nil
	})
	if err != nil {
		if errors.Is(err, gojwt.ErrTokenExpired) {
			return nil, domain.ErrTokenExpired
		}
		return nil, domain.ErrTokenInvalid
	}
	claims, ok := token.Claims.(*RefreshClaims)
	if !ok || !token.Valid {
		return nil, domain.ErrTokenInvalid
	}
	return claims, nil
}
