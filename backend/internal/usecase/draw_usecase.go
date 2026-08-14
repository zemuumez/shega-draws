package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/repository"
	"github.com/shega-draws/backend/pkg/crypto"
)

// DrawUseCase handles draw lifecycle: creation, closing entries, and reveal.
type DrawUseCase struct {
	drawRepo  repository.DrawRepository
	entryRepo repository.EntryRepository
}

// NewDrawUseCase constructs a DrawUseCase.
func NewDrawUseCase(drawRepo repository.DrawRepository, entryRepo repository.EntryRepository) *DrawUseCase {
	return &DrawUseCase{drawRepo: drawRepo, entryRepo: entryRepo}
}

// CreateDrawInput contains data required to create a new draw.
type CreateDrawInput struct {
	DrawID   string    `validate:"required"`
	SanityID string    `validate:"required"`
	Deadline time.Time `validate:"required"`
}

// CreateDraw creates a new draw, generating a secret seed and publishing its commitment.
// Only one active (open) draw can exist at a time.
func (uc *DrawUseCase) CreateDraw(ctx context.Context, input CreateDrawInput, actorID uuid.UUID) (*domain.Draw, error) {
	// Check for existing open draw
	if _, err := uc.drawRepo.FindActive(ctx); err == nil {
		return nil, domain.ErrDrawAlreadyOpen
	}

	seed, err := crypto.GenerateSeed()
	if err != nil {
		return nil, fmt.Errorf("generating draw seed: %w", err)
	}
	commitment := crypto.SHA256Hex(seed)

	draw := &domain.Draw{
		ID:         uuid.New(),
		DrawID:     input.DrawID,
		SanityID:   input.SanityID,
		Seed:       &seed,
		Commitment: commitment,
		Status:     domain.DrawStatusOpen,
		Deadline:   input.Deadline,
		CreatedAt:  time.Now(),
	}

	created, err := uc.drawRepo.Create(ctx, draw)
	if err != nil {
		return nil, fmt.Errorf("persisting draw: %w", err)
	}

	log.Info().
		Str("draw_id", created.DrawID).
		Str("commitment", created.Commitment).
		Msg("new draw created — commitment published")

	return created, nil
}

// GetActiveDraw returns the current open draw (public — no seed exposed).
func (uc *DrawUseCase) GetActiveDraw(ctx context.Context) (*domain.Draw, error) {
	draw, err := uc.drawRepo.FindActive(ctx)
	if err != nil {
		return nil, domain.ErrDrawNotFound
	}
	// Never expose the seed before reveal
	draw.Seed = nil
	return draw, nil
}

// ListDraws returns draws optionally filtered by status (seeds are only included for revealed draws).
func (uc *DrawUseCase) ListDraws(ctx context.Context, status *domain.DrawStatus) ([]*domain.Draw, error) {
	draws, err := uc.drawRepo.List(ctx, status)
	if err != nil {
		return nil, err
	}
	for _, d := range draws {
		if d.Status != domain.DrawStatusRevealed {
			d.Seed = nil
		}
	}
	return draws, nil
}

// CloseEntries transitions an open draw to closed, preventing new entries.
// The seed remains secret.
func (uc *DrawUseCase) CloseEntries(ctx context.Context, drawID uuid.UUID, actorID uuid.UUID) (*domain.Draw, error) {
	draw, err := uc.drawRepo.FindByID(ctx, drawID)
	if err != nil {
		return nil, domain.ErrDrawNotFound
	}
	if draw.Status != domain.DrawStatusOpen {
		return nil, domain.ErrDrawNotOpen
	}

	if err := uc.drawRepo.UpdateStatus(ctx, drawID, domain.DrawStatusClosed, actorID); err != nil {
		return nil, fmt.Errorf("closing draw: %w", err)
	}

	// Audit
	_ = uc.entryRepo.LogAudit(ctx, actorID, "close_draw", &drawID, nil)

	log.Info().Str("draw_id", draw.DrawID).Str("actor", actorID.String()).Msg("draw entries closed")
	draw.Status = domain.DrawStatusClosed
	return draw, nil
}

// RevealDraw runs the draw, persists winning numbers, and reveals the seed publicly.
// This is the point of no return — it writes the seed and numbers atomically.
func (uc *DrawUseCase) RevealDraw(ctx context.Context, drawID uuid.UUID, actorID uuid.UUID) (*domain.Draw, error) {
	draw, err := uc.drawRepo.FindByID(ctx, drawID)
	if err != nil {
		return nil, domain.ErrDrawNotFound
	}
	if !draw.CanReveal() {
		if draw.Status == domain.DrawStatusRevealed {
			return nil, domain.ErrDrawAlreadyRevld
		}
		return nil, domain.ErrDrawNotClosed
	}
	if draw.Seed == nil {
		return nil, fmt.Errorf("draw has no seed — data integrity error")
	}

	// Derive winning numbers for ranks 1–10
	winningNumbers := make(map[int]string, 10)
	for rank := 1; rank <= 10; rank++ {
		winningNumbers[rank] = crypto.DeriveWinningNumber(*draw.Seed, draw.DrawID, rank)
	}

	if err := uc.drawRepo.SetWinningNumbers(ctx, drawID, *draw.Seed, winningNumbers, actorID); err != nil {
		return nil, fmt.Errorf("persisting winning numbers: %w", err)
	}

	// Audit
	meta := map[string]interface{}{"commitment": draw.Commitment}
	_ = uc.entryRepo.LogAudit(ctx, actorID, "reveal_draw", &drawID, meta)

	log.Info().
		Str("draw_id", draw.DrawID).
		Str("seed", *draw.Seed).
		Interface("winners", winningNumbers).
		Msg("draw revealed")

	draw.Status = domain.DrawStatusRevealed
	draw.WinningNumbers = winningNumbers
	return draw, nil
}
