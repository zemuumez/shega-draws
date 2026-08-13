package domain

import "errors"

// Sentinel domain errors — use errors.Is() for matching.
var (
	// Auth
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden: insufficient role")
	ErrTokenExpired       = errors.New("token expired")
	ErrTokenInvalid       = errors.New("token invalid")

	// User
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists with this phone number")

	// Draw
	ErrDrawNotFound     = errors.New("draw not found")
	ErrDrawNotOpen      = errors.New("draw is not open for entries")
	ErrDrawAlreadyOpen  = errors.New("an active draw already exists")
	ErrDrawNotClosed    = errors.New("draw must be closed before reveal")
	ErrDrawAlreadyRevld = errors.New("draw has already been revealed")

	// Entry
	ErrEntryNotFound      = errors.New("entry not found")
	ErrNumberTaken        = errors.New("number already taken by a confirmed entry in this draw")
	ErrEntryAlreadyActed  = errors.New("entry has already been confirmed or rejected")
	ErrProofRequired      = errors.New("payment proof image is required")
	ErrProofTooLarge      = errors.New("payment proof exceeds maximum allowed size (5 MB)")
	ErrProofInvalidType   = errors.New("payment proof must be a JPEG, PNG, or WEBP image")

	// General
	ErrInternalServer = errors.New("internal server error")
	ErrValidation     = errors.New("validation error")
)
