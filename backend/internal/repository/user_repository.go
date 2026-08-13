// Package repository defines the interfaces (contracts) for data persistence.
// Implementations live in internal/infrastructure/postgres.
package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/shega-draws/backend/internal/domain"
)

// UserRepository defines all data operations for the User entity.
type UserRepository interface {
	// Create persists a new user and returns the created record.
	Create(ctx context.Context, user *domain.User) (*domain.User, error)
	// FindByID retrieves a user by their UUID.
	FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	// FindByPhone retrieves a user by their phone number (unique).
	FindByPhone(ctx context.Context, phone string) (*domain.User, error)
	// ExistsByPhone returns true if a user with the given phone number exists.
	ExistsByPhone(ctx context.Context, phone string) (bool, error)
	// UpdateRole changes a user's role (superadmin only).
	UpdateRole(ctx context.Context, id uuid.UUID, role domain.Role) error
}
