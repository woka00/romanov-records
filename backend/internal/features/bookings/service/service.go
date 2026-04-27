package bookings_service

import (
	"context"
	"fmt"
	"romanov/backend/internal/core/domain"
	bookings_repository "romanov/backend/internal/features/bookings/repository"
	"time"

	"github.com/go-playground/validator/v10"
)

// Notifier is satisfied by anything that can be told a new booking happened.
// Kept tiny so the service stays decoupled from the transport (Telegram, email, ...).
type Notifier interface {
	NotifyNewBooking(ctx context.Context, booking domain.Booking)
}

type Service struct {
	repo     bookings_repository.Repository
	validate *validator.Validate
	notifier Notifier
}

func NewService(repo bookings_repository.Repository, notifier Notifier) *Service {
	v := validator.New()

	return &Service{
		repo:     repo,
		validate: v,
		notifier: notifier,
	}
}

func (s *Service) CreateBooking(
	ctx context.Context,
	input CreateBookingInput,
) (int, error) {
	if err := s.validate.Struct(input); err != nil {
		return 0, fmt.Errorf("validate CreateBooking: %w", err)
	}

	desiredDate, err := time.Parse("2006-01-02", input.DesiredDate)
	if err != nil {
		return 0, fmt.Errorf("desiredDate parse: %w", err)
	}

	desiredTime, err := time.Parse("15:04", input.DesiredTime)
	if err != nil {
		return 0, fmt.Errorf("desiredTime parse: %w", err)
	}

	now := time.Now()
	booking := domain.Booking{
		FullName:         input.FullName,
		PhoneNumber:      input.PhoneNumber,
		TelegramUsername: input.TelegramUsername,
		DesiredDate:      desiredDate,
		DesiredTime:      desiredTime,
		DurationHours:    input.DurationHours,
		RequestDetails:   input.RequestDetails,
		Comment:          input.Comment,
		Status:           "new",
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	id, err := s.repo.Create(ctx, booking)
	if err != nil {
		return 0, err
	}

	if s.notifier != nil {
		booking.ID = id
		// Fire-and-forget: don't block the HTTP response on Telegram I/O,
		// and don't fail the booking just because the notifier is down.
		go s.notifier.NotifyNewBooking(context.WithoutCancel(ctx), booking)
	}

	return id, nil
}

func (s *Service) ListBookings(ctx context.Context) ([]domain.Booking, error) {
	return s.repo.List(ctx)
}

func (s *Service) GetBusyTimes(ctx context.Context, date string) ([]string, error) {
	d, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format, expected YYYY-MM-DD: %w", err)
	}

	return s.repo.GetBusyTimes(ctx, d)
}

var allowedStatuses = map[string]bool{
	"new":         true,
	"Согласовано": true,
	"Выполнено":   true,
}

func (s *Service) UpdateBookingStatus(ctx context.Context, id int, status string) error {
	if !allowedStatuses[status] {
		return fmt.Errorf("недопустимый статус: %s", status)
	}

	return s.repo.UpdateStatus(ctx, id, status)
}
