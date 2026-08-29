// Package usecase contains application-specific business logic.
// Use cases orchestrate domain entities and call repository interfaces.
// They must never import delivery (HTTP) or infrastructure packages.
package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/repository"
	"github.com/shega-draws/backend/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
)

// TokenStore is an interface to Redis for refresh token management.
type TokenStore interface {
	// StoreRefreshToken saves a refresh token JTI with TTL.
	StoreRefreshToken(ctx context.Context, userID, tokenID string, ttl time.Duration) error
	// IsRefreshTokenValid checks existence (non-revoked) of a token JTI.
	IsRefreshTokenValid(ctx context.Context, userID, tokenID string) (bool, error)
	// RevokeRefreshToken deletes a token JTI (logout).
	RevokeRefreshToken(ctx context.Context, userID, tokenID string) error
}

// AuthUseCase handles all authentication flows.
type AuthUseCase struct {
	userRepo     repository.UserRepository
	jwtManager   *jwt.Manager
	tokenStore   TokenStore
	refreshExpiry time.Duration
}

// NewAuthUseCase constructs an AuthUseCase.
func NewAuthUseCase(
	userRepo repository.UserRepository,
	jwtManager *jwt.Manager,
	tokenStore TokenStore,
	refreshExpiry time.Duration,
) *AuthUseCase {
	return &AuthUseCase{
		userRepo:     userRepo,
		jwtManager:   jwtManager,
		tokenStore:   tokenStore,
		refreshExpiry: refreshExpiry,
	}
}

// RegisterPlayerInput is the data needed to create a player account.
type RegisterPlayerInput struct {
	Name  string `validate:"required,min=2,max=100"`
	Phone string `validate:"required,e164"`
}

// TokenPair holds both access and refresh tokens.
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// RegisterPlayer creates a phone-only player account or logs in existing player and issues tokens.
func (uc *AuthUseCase) RegisterPlayer(ctx context.Context, input RegisterPlayerInput) (*TokenPair, *domain.User, error) {
	exists, err := uc.userRepo.ExistsByPhone(ctx, input.Phone)
	if err != nil {
		return nil, nil, fmt.Errorf("checking phone existence: %w", err)
	}
	if exists {
		existing, err := uc.userRepo.FindByPhone(ctx, input.Phone)
		if err != nil {
			return nil, nil, fmt.Errorf("finding existing player: %w", err)
		}
		pair, err := uc.issueTokens(ctx, existing)
		if err != nil {
			return nil, nil, err
		}
		log.Info().Str("user_id", existing.ID.String()).Str("phone", existing.Phone).Msg("existing player authenticated")
		return pair, existing, nil
	}

	user := &domain.User{
		ID:        uuid.New(),
		Name:      input.Name,
		Phone:     input.Phone,
		Role:      domain.RolePlayer,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	created, err := uc.userRepo.Create(ctx, user)
	if err != nil {
		return nil, nil, fmt.Errorf("creating player: %w", err)
	}

	pair, err := uc.issueTokens(ctx, created)
	if err != nil {
		return nil, nil, err
	}

	log.Info().Str("user_id", created.ID.String()).Str("phone", created.Phone).Msg("player registered")
	return pair, created, nil
}

// LoginPlayerInput is used for phone-only player login.
type LoginPlayerInput struct {
	Phone string `validate:"required,e164"`
}

// LoginPlayer authenticates a player by phone number.
func (uc *AuthUseCase) LoginPlayer(ctx context.Context, input LoginPlayerInput) (*TokenPair, *domain.User, error) {
	user, err := uc.userRepo.FindByPhone(ctx, input.Phone)
	if err != nil {
		return nil, nil, domain.ErrInvalidCredentials
	}

	pair, err := uc.issueTokens(ctx, user)
	if err != nil {
		return nil, nil, err
	}

	return pair, user, nil
}

// LoginAdminInput is used for admin/superadmin password login.
type LoginAdminInput struct {
	Phone    string `validate:"required"`
	Password string `validate:"required"`
}

// LoginAdmin validates credentials and issues tokens for admins.
func (uc *AuthUseCase) LoginAdmin(ctx context.Context, input LoginAdminInput) (*TokenPair, *domain.User, error) {
	user, err := uc.userRepo.FindByPhone(ctx, input.Phone)
	if err != nil {
		return nil, nil, domain.ErrInvalidCredentials
	}

	if !user.Role.AtLeast(domain.RoleAdmin) {
		return nil, nil, domain.ErrForbidden
	}

	if user.PasswordHash == nil {
		return nil, nil, domain.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(input.Password)); err != nil {
		log.Warn().Str("phone", input.Phone).Msg("failed admin login attempt")
		return nil, nil, domain.ErrInvalidCredentials
	}

	pair, err := uc.issueTokens(ctx, user)
	if err != nil {
		return nil, nil, err
	}

	log.Info().Str("user_id", user.ID.String()).Str("role", string(user.Role)).Msg("admin logged in")
	return pair, user, nil
}

// RefreshInput holds the refresh token from the client cookie.
type RefreshInput struct {
	RefreshToken string
}

// RefreshTokens rotates the refresh token and issues a new access token.
func (uc *AuthUseCase) RefreshTokens(ctx context.Context, input RefreshInput) (*TokenPair, error) {
	claims, err := uc.jwtManager.ValidateRefreshToken(input.RefreshToken)
	if err != nil {
		return nil, err
	}

	valid, err := uc.tokenStore.IsRefreshTokenValid(ctx, claims.UserID, claims.TokenID)
	if err != nil || !valid {
		return nil, domain.ErrTokenInvalid
	}

	// Revoke old token (rotation)
	_ = uc.tokenStore.RevokeRefreshToken(ctx, claims.UserID, claims.TokenID)

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, domain.ErrTokenInvalid
	}

	user, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, domain.ErrUserNotFound
	}

	return uc.issueTokens(ctx, user)
}

// Logout revokes a refresh token JTI.
func (uc *AuthUseCase) Logout(ctx context.Context, refreshToken string) error {
	claims, err := uc.jwtManager.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil // Token already invalid — treat as success
	}
	return uc.tokenStore.RevokeRefreshToken(ctx, claims.UserID, claims.TokenID)
}

// issueTokens is a shared helper that creates an access + refresh token pair.
func (uc *AuthUseCase) issueTokens(ctx context.Context, user *domain.User) (*TokenPair, error) {
	accessToken, err := uc.jwtManager.IssueAccessToken(user.ID, user.Role)
	if err != nil {
		return nil, fmt.Errorf("issuing access token: %w", err)
	}

	refreshToken, tokenID, err := uc.jwtManager.IssueRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("issuing refresh token: %w", err)
	}

	if err := uc.tokenStore.StoreRefreshToken(ctx, user.ID.String(), tokenID, uc.refreshExpiry); err != nil {
		return nil, fmt.Errorf("storing refresh token: %w", err)
	}

	return &TokenPair{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}
