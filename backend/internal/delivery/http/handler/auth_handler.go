package handler

import (
	"net/http"
	"time"

	"github.com/shega-draws/backend/internal/delivery/http/middleware"
	"github.com/shega-draws/backend/internal/usecase"
	"github.com/shega-draws/backend/pkg/validator"
)

// AuthHandler handles authentication routes.
type AuthHandler struct {
	authUC        *usecase.AuthUseCase
	refreshExpiry time.Duration
}

// NewAuthHandler constructs an AuthHandler.
func NewAuthHandler(authUC *usecase.AuthUseCase, refreshExpiry time.Duration) *AuthHandler {
	return &AuthHandler{authUC: authUC, refreshExpiry: refreshExpiry}
}

// RegisterPlayer handles POST /api/v1/auth/register
// Creates a phone-only player account and returns tokens.
func (h *AuthHandler) RegisterPlayer(w http.ResponseWriter, r *http.Request) {
	var input usecase.RegisterPlayerInput
	if !decodeJSON(w, r, &input) {
		return
	}
	if err := validator.Validate(input); err != nil {
		respondError(w, err)
		return
	}

	tokens, user, err := h.authUC.RegisterPlayer(r.Context(), input)
	if err != nil {
		respondError(w, err)
		return
	}

	h.setRefreshCookie(w, tokens.RefreshToken)
	respond(w, http.StatusCreated, map[string]interface{}{
		"access_token": tokens.AccessToken,
		"user": map[string]interface{}{
			"id":    user.ID,
			"name":  user.Name,
			"phone": user.Phone,
			"role":  user.Role,
		},
	})
}

// LoginAdmin handles POST /api/v1/auth/login
// Password-based login for admin and superadmin users.
func (h *AuthHandler) LoginAdmin(w http.ResponseWriter, r *http.Request) {
	var input usecase.LoginAdminInput
	if !decodeJSON(w, r, &input) {
		return
	}

	tokens, user, err := h.authUC.LoginAdmin(r.Context(), input)
	if err != nil {
		respondError(w, err)
		return
	}

	h.setRefreshCookie(w, tokens.RefreshToken)
	respond(w, http.StatusOK, map[string]interface{}{
		"access_token": tokens.AccessToken,
		"user": map[string]interface{}{
			"id":    user.ID,
			"name":  user.Name,
			"phone": user.Phone,
			"role":  user.Role,
		},
	})
}

// Refresh handles POST /api/v1/auth/refresh
// Rotates the refresh token and issues a new access token.
func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		respondError(w, errToUnauthorized("missing refresh token cookie"))
		return
	}

	tokens, err := h.authUC.RefreshTokens(r.Context(), usecase.RefreshInput{RefreshToken: cookie.Value})
	if err != nil {
		respondError(w, err)
		return
	}

	h.setRefreshCookie(w, tokens.RefreshToken)
	respond(w, http.StatusOK, map[string]string{"access_token": tokens.AccessToken})
}

// Logout handles POST /api/v1/auth/logout
// Revokes the refresh token.
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err == nil {
		_ = h.authUC.Logout(r.Context(), cookie.Value)
	}
	// Clear the cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
	respond(w, http.StatusOK, map[string]string{"message": "logged out"})
}

// Me handles GET /api/v1/auth/me — returns the current user from token claims.
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		respondError(w, errToUnauthorized("not authenticated"))
		return
	}
	respond(w, http.StatusOK, map[string]interface{}{
		"user_id": claims.UserID,
		"role":    claims.Role,
	})
}

// setRefreshCookie writes the refresh token as a secure, httpOnly cookie.
func (h *AuthHandler) setRefreshCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    token,
		Path:     "/api/v1/auth",
		MaxAge:   int(h.refreshExpiry.Seconds()),
		HttpOnly: true,   // Not accessible by JavaScript — XSS protection
		Secure:   true,   // HTTPS only
		SameSite: http.SameSiteStrictMode,
	})
}

func errToUnauthorized(msg string) error {
	return &domainErr{msg: msg, status: http.StatusUnauthorized}
}

type domainErr struct {
	msg    string
	status int
}

func (e *domainErr) Error() string { return e.msg }
