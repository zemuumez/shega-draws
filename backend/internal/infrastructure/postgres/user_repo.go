package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/repository"
)

type userRepo struct {
	pool *pgxpool.Pool
}

// NewUserRepository constructs a PostgreSQL-backed UserRepository.
func NewUserRepository(pool *pgxpool.Pool) repository.UserRepository {
	return &userRepo{pool: pool}
}

func (r *userRepo) Create(ctx context.Context, user *domain.User) (*domain.User, error) {
	query := `
		INSERT INTO users (id, name, phone, role, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, phone, role, password_hash, created_at, updated_at`

	var u domain.User
	err := r.pool.QueryRow(ctx, query,
		user.ID, user.Name, user.Phone, string(user.Role),
		user.PasswordHash, user.CreatedAt, user.UpdatedAt,
	).Scan(&u.ID, &u.Name, &u.Phone, &u.Role, &u.PasswordHash, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("inserting user: %w", err)
	}
	return &u, nil
}

func (r *userRepo) FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `SELECT id, name, phone, role, password_hash, created_at, updated_at FROM users WHERE id = $1`
	var u domain.User
	err := r.pool.QueryRow(ctx, query, id).
		Scan(&u.ID, &u.Name, &u.Phone, &u.Role, &u.PasswordHash, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("finding user by id: %w", err)
	}
	return &u, nil
}

func (r *userRepo) FindByPhone(ctx context.Context, phone string) (*domain.User, error) {
	query := `SELECT id, name, phone, role, password_hash, created_at, updated_at FROM users WHERE phone = $1`
	var u domain.User
	err := r.pool.QueryRow(ctx, query, phone).
		Scan(&u.ID, &u.Name, &u.Phone, &u.Role, &u.PasswordHash, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("finding user by phone: %w", err)
	}
	return &u, nil
}

func (r *userRepo) ExistsByPhone(ctx context.Context, phone string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE phone = $1)`, phone).Scan(&exists)
	return exists, err
}

func (r *userRepo) UpdateRole(ctx context.Context, id uuid.UUID, role domain.Role) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE users SET role = $1, updated_at = $2 WHERE id = $3`,
		string(role), time.Now(), id,
	)
	return err
}
