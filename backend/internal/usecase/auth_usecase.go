// Package usecase contains application-specific business logic.
// Use cases orchestrate domain entities and call repository interfaces.
// They must never import delivery (HTTP) or infrastructure packages.
package usecase

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/repository"
	"github.com/shega-draws/backend/pkg/jwt"
	"github.com/shega-draws/backend/pkg/validator"
	"golang.org/x/crypto/bcrypt"
)

// TokenStore is an interface to Redis for refresh token management.
type TokenStore interface {
	AllowPlayerLogin(ctx context.Context, phone string) (bool, error)
	// StoreRefreshToken saves a refresh token JTI with TTL.
	StoreRefreshToken(ctx context.Context, userID, tokenID string, ttl time.Duration) error
	// ConsumeRefreshToken atomically validates and removes a token JTI.
	ConsumeRefreshToken(ctx context.Context, userID, tokenID string) (bool, error)
	// RevokeRefreshToken deletes a token JTI (logout).
	RevokeRefreshToken(ctx context.Context, userID, tokenID string) error
}

// AuthUseCase handles all authentication flows.
type AuthUseCase struct {
	userRepo      repository.UserRepository
	jwtManager    *jwt.Manager
	tokenStore    TokenStore
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
		userRepo:      userRepo,
		jwtManager:    jwtManager,
		tokenStore:    tokenStore,
		refreshExpiry: refreshExpiry,
	}
}

const dummyBcryptHash = "$2a$12$e8Yk2uRk2qT1.Hk2Vf9V.uO2qR8N5G9r4P5s6T7u8V9w0x1y2z3A4"

// RegisterPlayerInput is the data needed to create a player account.
type RegisterPlayerInput struct {
	Name  string `validate:"required,min=2,max=100"`
	Phone string `validate:"required,e164"`
	PIN   string `validate:"required,len=4,number"`
}

// TokenPair holds both access and refresh tokens.
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// RegisterPlayer creates a player account with a bcrypt-hashed PIN and issues tokens.
func (uc *AuthUseCase) RegisterPlayer(ctx context.Context, input RegisterPlayerInput) (*TokenPair, *domain.User, error) {
	input.Phone = NormalizePhone(input.Phone)
	input.Name = strings.TrimSpace(input.Name)
	if err := validator.Validate(input); err != nil {
		return nil, nil, err
	}

	exists, err := uc.userRepo.ExistsByPhone(ctx, input.Phone)
	if err != nil {
		return nil, nil, fmt.Errorf("checking phone existence: %w", err)
	}
	if exists {
		return nil, nil, domain.ErrUserAlreadyExists
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(input.PIN), 12)
	if err != nil {
		return nil, nil, fmt.Errorf("hashing pin: %w", err)
	}
	hashStr := string(hashBytes)

	user := &domain.User{
		ID:           uuid.New(),
		Name:         input.Name,
		Phone:        input.Phone,
		Role:         domain.RolePlayer,
		PasswordHash: &hashStr,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
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

// LoginPlayerInput is used for player login with 4-digit PIN.
type LoginPlayerInput struct {
	Phone string `validate:"required,e164"`
	PIN   string `validate:"required,len=4,number"`
}

// LoginPlayer authenticates a player by phone and bcrypt-hashed PIN with anti-enumeration protection.
func (uc *AuthUseCase) LoginPlayer(ctx context.Context, input LoginPlayerInput) (*TokenPair, *domain.User, error) {
	input.Phone = NormalizePhone(input.Phone)
	if err := validator.Validate(input); err != nil {
		return nil, nil, err
	}

	allowed, err := uc.tokenStore.AllowPlayerLogin(ctx, input.Phone)
	if err != nil {
		return nil, nil, err
	}
	if !allowed {
		return nil, nil, domain.ErrTooManyAttempts
	}

	user, err := uc.userRepo.FindByPhone(ctx, input.Phone)
	if err != nil {
		if !errors.Is(err, domain.ErrUserNotFound) {
			return nil, nil, err
		}
		_ = bcrypt.CompareHashAndPassword([]byte(dummyBcryptHash), []byte(input.PIN))
		return nil, nil, domain.ErrInvalidCredentials
	}

	if user.Role != domain.RolePlayer || user.PasswordHash == nil {
		_ = bcrypt.CompareHashAndPassword([]byte(dummyBcryptHash), []byte(input.PIN))
		return nil, nil, domain.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(input.PIN)); err != nil {
		log.Warn().Str("phone", input.Phone).Msg("failed player login attempt")
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

// LoginAdmin validates credentials and issues tokens for admins with anti-enumeration protection.
func (uc *AuthUseCase) LoginAdmin(ctx context.Context, input LoginAdminInput) (*TokenPair, *domain.User, error) {
	user, err := uc.userRepo.FindByPhone(ctx, input.Phone)
	if err != nil {
		if !errors.Is(err, domain.ErrUserNotFound) {
			return nil, nil, err
		}
		_ = bcrypt.CompareHashAndPassword([]byte(dummyBcryptHash), []byte(input.Password))
		return nil, nil, domain.ErrInvalidCredentials
	}

	if !user.Role.AtLeast(domain.RoleAdmin) {
		_ = bcrypt.CompareHashAndPassword([]byte(dummyBcryptHash), []byte(input.Password))
		return nil, nil, domain.ErrForbidden
	}

	if user.PasswordHash == nil {
		_ = bcrypt.CompareHashAndPassword([]byte(dummyBcryptHash), []byte(input.Password))
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

	valid, err := uc.tokenStore.ConsumeRefreshToken(ctx, claims.UserID, claims.TokenID)
	if err != nil {
		return nil, err
	}
	if !valid {
		return nil, domain.ErrTokenInvalid
	}

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

// NormalizePhone accepts Ethiopian local numbers and international E.164 input.
func NormalizePhone(phone string) string {
	phone = strings.NewReplacer(" ", "", "-", "", "(", "", ")", "").Replace(strings.TrimSpace(phone))
	if len(phone) == 10 && (strings.HasPrefix(phone, "09") || strings.HasPrefix(phone, "07")) {
		return "+251" + phone[1:]
	}
	if strings.HasPrefix(phone, "00") {
		return "+" + phone[2:]
	}
	if len(phone) == 12 && strings.HasPrefix(phone, "251") {
		return "+" + phone
	}
	return phone
}

func (uc *AuthUseCase) GetUser(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	return uc.userRepo.FindByID(ctx, id)
}
