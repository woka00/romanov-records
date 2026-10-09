package admins_repository

import (
	"context"
	"errors"
	"fmt"
	"romanov/backend/internal/core/domain"

	"github.com/jackc/pgx/v5"
)

type Repository interface {
	GetByLogin(ctx context.Context, login string) (domain.Admin, error)
}

var ErrAdminNotFound = errors.New("admin not found")

type QueryRower interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

type PostgresRepository struct {
	db QueryRower
}

func NewPostgresRepository(db QueryRower) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) GetByLogin(ctx context.Context, login string) (domain.Admin, error) {
	query := `
		SELECT id, login, password_hash, created_at
		FROM romanov.admins
		WHERE login = $1
	`

	var admin domain.Admin

	err := r.db.QueryRow(ctx, query, login).Scan(
		&admin.ID,
		&admin.Login,
		&admin.PasswordHash,
		&admin.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Admin{}, ErrAdminNotFound
		}

		return domain.Admin{}, fmt.Errorf("get admin by login: %w", err)
	}

	return admin, nil
}
