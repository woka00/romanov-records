package bookings_repository

import (
	"context"
	"errors"
	"fmt"
	"romanov/backend/internal/core/domain"
	"time"

	"github.com/jackc/pgx/v5"
)

var ErrBookingNotFound = errors.New("booking not found")

type Repository interface {
	Create(ctx context.Context, booking domain.Booking) (int, error)
	List(ctx context.Context) ([]domain.Booking, error)
	GetBusyTimes(ctx context.Context, date time.Time) ([]string, error)
	UpdateStatus(ctx context.Context, id int, status string) error
}

type PostgresRepository struct {
	conn *pgx.Conn
}

func NewPostgresRepository(conn *pgx.Conn) *PostgresRepository {
	return &PostgresRepository{
		conn: conn,
	}
}

func (r *PostgresRepository) Create(
	ctx context.Context,
	booking domain.Booking,
) (int, error) {
	sqlQuery := `
	INSERT INTO romanov.bookings(
		full_name,
		phone_number,
		telegram_username,
		desired_date,
		desired_time,
		duration_hours,
		request_details,
		comment,
		status,
		created_at,
		updated_at
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	RETURNING id
	`
	var id int

	err := r.conn.QueryRow(
		ctx,
		sqlQuery,
		booking.FullName,
		booking.PhoneNumber,
		booking.TelegramUsername,
		booking.DesiredDate,
		booking.DesiredTime,
		booking.DurationHours,
		booking.RequestDetails,
		booking.Comment,
		booking.Status,
		booking.CreatedAt,
		booking.UpdatedAt,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("create booking: %w", err)
	}

	return id, nil
}

func (r *PostgresRepository) List(ctx context.Context) ([]domain.Booking, error) {
	sqlQuery := `
		SELECT
			id,
			full_name,
			phone_number,
			telegram_username,
			desired_date,
			desired_time,
			request_details,
			comment,
			status,
			created_at,
			updated_at
		FROM romanov.bookings
		ORDER BY created_at DESC
	`

	rows, err := r.conn.Query(ctx, sqlQuery)
	if err != nil {
		return nil, fmt.Errorf("list bookings: %w", err)
	}
	defer rows.Close()

	bookings := make([]domain.Booking, 0)

	for rows.Next() {
		var booking domain.Booking

		if err := rows.Scan(
			&booking.ID,
			&booking.FullName,
			&booking.PhoneNumber,
			&booking.TelegramUsername,
			&booking.DesiredDate,
			&booking.DesiredTime,
			&booking.RequestDetails,
			&booking.Comment,
			&booking.Status,
			&booking.CreatedAt,
			&booking.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan booking: %w", err)
		}

		bookings = append(bookings, booking)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate bookings: %w", err)
	}

	return bookings, nil
}

func (r *PostgresRepository) GetBusyTimes(ctx context.Context, date time.Time) ([]string, error) {
	sqlQuery := `
		SELECT EXTRACT(HOUR FROM desired_time)::int,
		       EXTRACT(MINUTE FROM desired_time)::int,
		       duration_hours
		FROM romanov.bookings
		WHERE desired_date = $1
		  AND status != 'cancelled'
		ORDER BY desired_time
	`

	rows, err := r.conn.Query(ctx, sqlQuery, date)
	if err != nil {
		return nil, fmt.Errorf("get busy times: %w", err)
	}
	defer rows.Close()

	seen := make(map[string]struct{})
	slots := make([]string, 0)

	for rows.Next() {
		var h, m, dur int
		if err := rows.Scan(&h, &m, &dur); err != nil {
			return nil, fmt.Errorf("scan busy time: %w", err)
		}
		startMin := h*60 + m
		totalSlots := dur * 2 // каждые 30 минут
		for i := 0; i < totalSlots; i++ {
			t := startMin + i*30
			if t >= 24*60 {
				break
			}
			slot := fmt.Sprintf("%02d:%02d", t/60, t%60)
			if _, exists := seen[slot]; !exists {
				seen[slot] = struct{}{}
				slots = append(slots, slot)
			}
		}
	}

	return slots, rows.Err()
}

func (r *PostgresRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	sqlQuery := `
		UPDATE romanov.bookings
		SET status = $2, updated_at = NOW()
		WHERE id = $1
	`

	tag, err := r.conn.Exec(ctx, sqlQuery, id, status)
	if err != nil {
		return fmt.Errorf("update booking status: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return ErrBookingNotFound
	}

	return nil
}
