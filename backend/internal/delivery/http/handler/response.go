// Package handler contains HTTP handlers for the Shega Draws API.
package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/pkg/validator"
)

// respond writes a JSON response with the given status code.
func respond(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		json.NewEncoder(w).Encode(data) //nolint:errcheck
	}
}

// respondError maps domain errors to appropriate HTTP status codes.
func respondError(w http.ResponseWriter, err error) {
	// Validation errors
	if ve, ok := validator.IsValidationError(err); ok {
		respond(w, http.StatusUnprocessableEntity, map[string]interface{}{
			"error":  "validation failed",
			"fields": ve.Fields,
		})
		return
	}

	// Domain sentinel errors
	status := http.StatusInternalServerError
	switch {
	case errors.Is(err, domain.ErrInvalidCredentials):
		status = http.StatusUnauthorized
	case errors.Is(err, domain.ErrUnauthorized), errors.Is(err, domain.ErrTokenExpired), errors.Is(err, domain.ErrTokenInvalid):
		status = http.StatusUnauthorized
	case errors.Is(err, domain.ErrForbidden):
		status = http.StatusForbidden
	case errors.Is(err, domain.ErrUserNotFound), errors.Is(err, domain.ErrDrawNotFound), errors.Is(err, domain.ErrEntryNotFound):
		status = http.StatusNotFound
	case errors.Is(err, domain.ErrUserAlreadyExists):
		status = http.StatusConflict
	case errors.Is(err, domain.ErrNumberTaken):
		status = http.StatusConflict
	case errors.Is(err, domain.ErrDrawNotOpen), errors.Is(err, domain.ErrDrawAlreadyOpen),
		errors.Is(err, domain.ErrDrawNotClosed), errors.Is(err, domain.ErrDrawAlreadyRevld),
		errors.Is(err, domain.ErrEntryAlreadyActed):
		status = http.StatusBadRequest
	case errors.Is(err, domain.ErrProofRequired), errors.Is(err, domain.ErrProofTooLarge), errors.Is(err, domain.ErrProofInvalidType):
		status = http.StatusBadRequest
	}

	respond(w, status, map[string]string{"error": err.Error()})
}

// decodeJSON decodes the request body into v, returning false and writing an error if it fails.
func decodeJSON(w http.ResponseWriter, r *http.Request, v interface{}) bool {
	if err := json.NewDecoder(r.Body).Decode(v); err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return false
	}
	return true
}
