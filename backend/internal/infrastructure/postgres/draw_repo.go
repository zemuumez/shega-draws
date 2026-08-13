package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/repository"
)

type drawRepo struct {
	pool *pgxpool.Pool
}

// NewDrawRepository constructs a PostgreSQL-backed DrawRepository.
func NewDrawRepository(pool *pgxpool.Pool) repository.DrawRepository {
	return &drawRepo{pool: pool}
}

func (r *drawRepo) Create(ctx context.Context, draw *domain.Draw) (*domain.Draw, error) {
	query := `
		INSERT INTO draws (id, draw_id, sanity_id, seed, commitment, status, deadline, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, draw_id, sanity_id, commitment, status, deadline, created_at`

	var d domain.Draw
	err := r.pool.QueryRow(ctx, query,
		draw.ID, draw.DrawID, draw.SanityID, draw.Seed,
		draw.Commitment, string(draw.Status), draw.Deadline, draw.CreatedAt,
	).Scan(&d.ID, &d.DrawID, &d.SanityID, &d.Commitment, &d.Status, &d.Deadline, &d.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("inserting draw: %w", err)
	}
	return &d, nil
}

func (r *drawRepo) FindByID(ctx context.Context, id uuid.UUID) (*domain.Draw, error) {
	query := `
		SELECT id, draw_id, sanity_id, seed, commitment, status, deadline,
		       winning_numbers, created_at, closed_at, revealed_at, closed_by, revealed_by
		FROM draws WHERE id = $1`

	return r.scanDraw(r.pool.QueryRow(ctx, query, id))
}

func (r *drawRepo) FindActive(ctx context.Context) (*domain.Draw, error) {
	query := `
		SELECT id, draw_id, sanity_id, seed, commitment, status, deadline,
		       winning_numbers, created_at, closed_at, revealed_at, closed_by, revealed_by
		FROM draws WHERE status = 'open' ORDER BY created_at DESC LIMIT 1`

	draw, err := r.scanDraw(r.pool.QueryRow(ctx, query))
	if errors.Is(err, domain.ErrDrawNotFound) {
		return nil, domain.ErrDrawNotFound
	}
	return draw, err
}

func (r *drawRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.DrawStatus, actorID uuid.UUID) error {
	now := time.Now()
	var query string
	switch status {
	case domain.DrawStatusClosed:
		query = `UPDATE draws SET status = $1, closed_at = $2, closed_by = $3 WHERE id = $4`
	case domain.DrawStatusRevealed:
		query = `UPDATE draws SET status = $1, revealed_at = $2, revealed_by = $3 WHERE id = $4`
	default:
		return fmt.Errorf("invalid status transition: %s", status)
	}
	_, err := r.pool.Exec(ctx, query, string(status), now, actorID, id)
	return err
}

func (r *drawRepo) SetWinningNumbers(ctx context.Context, id uuid.UUID, seed string, numbers map[int]string, actorID uuid.UUID) error {
	numbersJSON, err := json.Marshal(numbers)
	if err != nil {
		return fmt.Errorf("marshaling winning numbers: %w", err)
	}
	now := time.Now()
	_, err = r.pool.Exec(ctx,
		`UPDATE draws SET seed = $1, winning_numbers = $2, status = 'revealed', revealed_at = $3, revealed_by = $4 WHERE id = $5`,
		seed, numbersJSON, now, actorID, id,
	)
	return err
}

func (r *drawRepo) scanDraw(row pgx.Row) (*domain.Draw, error) {
	var d domain.Draw
	var winningNumbersJSON []byte
	err := row.Scan(
		&d.ID, &d.DrawID, &d.SanityID, &d.Seed, &d.Commitment, &d.Status, &d.Deadline,
		&winningNumbersJSON, &d.CreatedAt, &d.ClosedAt, &d.RevealedAt, &d.ClosedBy, &d.RevealedBy,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrDrawNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("scanning draw: %w", err)
	}
	if winningNumbersJSON != nil {
		if err := json.Unmarshal(winningNumbersJSON, &d.WinningNumbers); err != nil {
			return nil, fmt.Errorf("unmarshaling winning numbers: %w", err)
		}
	}
	return &d, nil
}
