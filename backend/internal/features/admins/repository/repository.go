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

type PostgresRepository struct {
	conn *pgx.Conn
}

func NewPostgresRepository(conn *pgx.Conn) *PostgresRepository {
	return &PostgresRepository{conn: conn}
}

func (r *PostgresRepository) GetByLogin(ctx context.Context, login string) (domain.Admin, error) {
	query := `
		SELECT id, login, password_hash, created_at
		FROM romanov.admins
		WHERE login = $1
	`

	var admin domain.Admin

	err := r.conn.QueryRow(ctx, query, login).Scan(
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
