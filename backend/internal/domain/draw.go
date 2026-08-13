package domain

import (
	"time"

	"github.com/google/uuid"
)

// DrawStatus represents the lifecycle state of a draw.
type DrawStatus string

const (
	DrawStatusOpen     DrawStatus = "open"
	DrawStatusClosed   DrawStatus = "closed"
	DrawStatusRevealed DrawStatus = "revealed"
)

// Draw is the core draw entity.
type Draw struct {
	ID             uuid.UUID          `json:"id"`
	DrawID         string             `json:"draw_id"`    // Human-readable e.g. "SHEGA-0842"
	SanityID       string             `json:"sanity_id"`  // Sanity CMS document _id
	Seed           *string            `json:"-"`          // Secret until revealed
	Commitment     string             `json:"commitment"` // SHA-256(seed), always public
	Status         DrawStatus         `json:"status"`
	Deadline       time.Time          `json:"deadline"`
	WinningNumbers map[int]string     `json:"winning_numbers,omitempty"` // rank→number after reveal
	CreatedAt      time.Time          `json:"created_at"`
	ClosedAt       *time.Time         `json:"closed_at,omitempty"`
	RevealedAt     *time.Time         `json:"revealed_at,omitempty"`
	ClosedBy       *uuid.UUID         `json:"closed_by,omitempty"`
	RevealedBy     *uuid.UUID         `json:"revealed_by,omitempty"`
}

// IsOpen returns true if entries can still be submitted.
func (d *Draw) IsOpen() bool {
	return d.Status == DrawStatusOpen && time.Now().Before(d.Deadline)
}

// CanReveal returns true if the draw is closed and not yet revealed.
func (d *Draw) CanReveal() bool {
	return d.Status == DrawStatusClosed
}
