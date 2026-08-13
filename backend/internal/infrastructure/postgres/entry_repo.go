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

type entryRepo struct {
	pool *pgxpool.Pool
}

// NewEntryRepository constructs a PostgreSQL-backed EntryRepository.
func NewEntryRepository(pool *pgxpool.Pool) repository.EntryRepository {
	return &entryRepo{pool: pool}
}

func (r *entryRepo) Create(ctx context.Context, entry *domain.Entry) (*domain.Entry, error) {
	query := `
		INSERT INTO entries (id, draw_id, user_id, number, amount, method, proof_key, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, draw_id, user_id, number, amount, method, proof_key, status, created_at`

	var e domain.Entry
	err := r.pool.QueryRow(ctx, query,
		entry.ID, entry.DrawID, entry.UserID, entry.Number,
		entry.Amount, string(entry.Method), entry.ProofKey,
		string(entry.Status), entry.CreatedAt,
	).Scan(&e.ID, &e.DrawID, &e.UserID, &e.Number, &e.Amount, &e.Method, &e.ProofKey, &e.Status, &e.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("inserting entry: %w", err)
	}
	return &e, nil
}

func (r *entryRepo) FindByID(ctx context.Context, id uuid.UUID) (*domain.Entry, error) {
	query := `
		SELECT e.id, e.draw_id, e.user_id, e.number, e.amount, e.method, e.proof_key,
		       e.status, e.confirmed_by, e.rejected_by, e.created_at, e.confirmed_at, e.rejected_at,
		       u.name, u.phone
		FROM entries e
		JOIN users u ON u.id = e.user_id
		WHERE e.id = $1`

	e, err := r.scanEntry(r.pool.QueryRow(ctx, query, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrEntryNotFound
	}
	return e, err
}

func (r *entryRepo) FindAll(ctx context.Context, filter repository.EntryFilter) ([]*domain.Entry, error) {
	query := `
		SELECT e.id, e.draw_id, e.user_id, e.number, e.amount, e.method, e.proof_key,
		       e.status, e.confirmed_by, e.rejected_by, e.created_at, e.confirmed_at, e.rejected_at,
		       u.name, u.phone
		FROM entries e
		JOIN users u ON u.id = e.user_id
		WHERE ($1::uuid IS NULL OR e.draw_id = $1)
		  AND ($2::uuid IS NULL OR e.user_id = $2)
		  AND ($3::text IS NULL OR e.status = $3)
		ORDER BY e.created_at DESC`

	rows, err := r.pool.Query(ctx, query, filter.DrawID, filter.UserID, filter.Status)
	if err != nil {
		return nil, fmt.Errorf("querying entries: %w", err)
	}
	defer rows.Close()

	var entries []*domain.Entry
	for rows.Next() {
		e, err := r.scanEntry(rows)
		if err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

func (r *entryRepo) FindByUserAndDraw(ctx context.Context, userID, drawID uuid.UUID) ([]*domain.Entry, error) {
	filter := repository.EntryFilter{UserID: &userID, DrawID: &drawID}
	return r.FindAll(ctx, filter)
}

func (r *entryRepo) IsNumberTaken(ctx context.Context, drawID uuid.UUID, number string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM entries WHERE draw_id = $1 AND number = $2 AND status = 'confirmed')`,
		drawID, number,
	).Scan(&exists)
	return exists, err
}

func (r *entryRepo) Confirm(ctx context.Context, id, adminID uuid.UUID) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE entries SET status = 'confirmed', confirmed_by = $1, confirmed_at = $2 WHERE id = $3`,
		adminID, time.Now(), id,
	)
	return err
}

func (r *entryRepo) Reject(ctx context.Context, id, adminID uuid.UUID) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE entries SET status = 'rejected', rejected_by = $1, rejected_at = $2 WHERE id = $3`,
		adminID, time.Now(), id,
	)
	return err
}

func (r *entryRepo) LogAudit(ctx context.Context, actorID uuid.UUID, action string, targetID *uuid.UUID, metadata map[string]interface{}) error {
	var metaJSON []byte
	if metadata != nil {
		var err error
		metaJSON, err = json.Marshal(metadata)
		if err != nil {
			return err
		}
	}
	_, err := r.pool.Exec(ctx,
		`INSERT INTO audit_log (id, actor_id, action, target_id, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
		uuid.New(), actorID, action, targetID, metaJSON, time.Now(),
	)
	return err
}

// scanEntry scans a pgx Row/Rows into a domain.Entry.
func (r *entryRepo) scanEntry(row interface {
	Scan(...interface{}) error
}) (*domain.Entry, error) {
	var e domain.Entry
	err := row.Scan(
		&e.ID, &e.DrawID, &e.UserID, &e.Number, &e.Amount, &e.Method, &e.ProofKey,
		&e.Status, &e.ConfirmedBy, &e.RejectedBy, &e.CreatedAt, &e.ConfirmedAt, &e.RejectedAt,
		&e.UserName, &e.UserPhone,
	)
	if err != nil {
		return nil, err
	}
	return &e, nil
}
