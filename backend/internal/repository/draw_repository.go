package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/shega-draws/backend/internal/domain"
)

// DrawRepository defines all data operations for the Draw entity.
type DrawRepository interface {
	// Create persists a new draw.
	Create(ctx context.Context, draw *domain.Draw) (*domain.Draw, error)
	// FindByID retrieves a draw by UUID.
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Draw, error)
	// FindActive returns the single currently open draw, or ErrDrawNotFound.
	FindActive(ctx context.Context) (*domain.Draw, error)
	// List retrieves draws optionally filtered by status.
	List(ctx context.Context, status *domain.DrawStatus) ([]*domain.Draw, error)
	// UpdateStatus changes the draw status (open→closed→revealed).
	UpdateStatus(ctx context.Context, id uuid.UUID, status domain.DrawStatus, actorID uuid.UUID) error
	// SetWinningNumbers persists the revealed winning numbers and seed.
	SetWinningNumbers(ctx context.Context, id uuid.UUID, seed string, numbers map[int]string, actorID uuid.UUID) error
}
