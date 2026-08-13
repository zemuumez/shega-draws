package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/shega-draws/backend/internal/domain"
)

// EntryFilter holds optional filters for listing entries.
type EntryFilter struct {
	DrawID *uuid.UUID
	UserID *uuid.UUID
	Status *domain.EntryStatus
}

// EntryRepository defines all data operations for the Entry entity.
type EntryRepository interface {
	// Create persists a new entry.
	Create(ctx context.Context, entry *domain.Entry) (*domain.Entry, error)
	// FindByID retrieves an entry by UUID.
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Entry, error)
	// FindAll lists entries matching the filter (admin use).
	FindAll(ctx context.Context, filter EntryFilter) ([]*domain.Entry, error)
	// FindByUserAndDraw retrieves entries for a specific player in a draw.
	FindByUserAndDraw(ctx context.Context, userID, drawID uuid.UUID) ([]*domain.Entry, error)
	// IsNumberTaken checks whether a number is already held by a confirmed entry in this draw.
	IsNumberTaken(ctx context.Context, drawID uuid.UUID, number string) (bool, error)
	// Confirm marks an entry as confirmed by an admin.
	Confirm(ctx context.Context, id, adminID uuid.UUID) error
	// Reject marks an entry as rejected by an admin.
	Reject(ctx context.Context, id, adminID uuid.UUID) error
	// LogAudit records an admin action to the audit log.
	LogAudit(ctx context.Context, actorID uuid.UUID, action string, targetID *uuid.UUID, metadata map[string]interface{}) error
}
