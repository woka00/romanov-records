//go:build integration

package bookings_repository

import (
	"context"
	"errors"
	"os"
	"romanov/backend/internal/core/domain"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func TestConcurrentBookingInvariant(t *testing.T) {
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is not set")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		t.Fatalf("connect test database: %v", err)
	}
	defer pool.Close()

	testDate := time.Date(2099, time.January, 2, 0, 0, 0, 0, time.UTC)
	if _, err := pool.Exec(ctx, "DELETE FROM romanov.bookings WHERE desired_date = $1", testDate); err != nil {
		t.Fatalf("clean test data: %v", err)
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(context.Background(), "DELETE FROM romanov.bookings WHERE desired_date = $1", testDate)
	})

	repository := NewPostgresRepository(pool)
	first := integrationBooking(testDate, 12, 0, 2)
	firstID, err := repository.Create(ctx, first)
	if err != nil {
		t.Fatalf("create first booking: %v", err)
	}

	overlapping := integrationBooking(testDate, 13, 0, 1)
	if _, err := repository.Create(ctx, overlapping); !errors.Is(err, ErrBookingConflict) {
		t.Fatalf("overlapping create error = %v, want %v", err, ErrBookingConflict)
	}

	if err := repository.UpdateStatus(ctx, firstID, string(domain.BookingStatusCancelled)); err != nil {
		t.Fatalf("cancel first booking: %v", err)
	}
	secondID, err := repository.Create(ctx, overlapping)
	if err != nil {
		t.Fatalf("create after cancellation: %v", err)
	}
	if err := repository.UpdateStatus(ctx, firstID, string(domain.BookingStatusNew)); !errors.Is(err, ErrBookingConflict) {
		t.Fatalf("restore conflicting booking error = %v, want %v", err, ErrBookingConflict)
	}
	if err := repository.UpdateStatus(ctx, secondID, string(domain.BookingStatusNew)); !errors.Is(err, ErrInvalidTransition) {
		t.Fatalf("same-status transition error = %v, want %v", err, ErrInvalidTransition)
	}

	crossMidnight := integrationBooking(testDate, 23, 0, 2)
	if _, err := repository.Create(ctx, crossMidnight); err != nil {
		t.Fatalf("create cross-midnight booking: %v", err)
	}
	busy, err := repository.GetBusyTimes(ctx, testDate.AddDate(0, 0, 1))
	if err != nil {
		t.Fatalf("get next-day busy times: %v", err)
	}
	if len(busy) != 2 || busy[0] != "00:00" || busy[1] != "00:30" {
		t.Fatalf("next-day busy times = %v, want [00:00 00:30]", busy)
	}
}

func integrationBooking(date time.Time, hour, minute, duration int) domain.Booking {
	now := time.Now().UTC()
	return domain.Booking{
		FullName:       "Integration Test",
		PhoneNumber:    "+79990000001",
		DesiredDate:    date,
		DesiredTime:    time.Date(0, 1, 1, hour, minute, 0, 0, time.UTC),
		DurationHours:  duration,
		RequestDetails: "integration test",
		Status:         domain.BookingStatusNew,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}
