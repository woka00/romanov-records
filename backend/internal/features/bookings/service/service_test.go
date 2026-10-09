package bookings_service

import (
	"context"
	"errors"
	"romanov/backend/internal/core/domain"
	"testing"
	"time"
)

type fakeRepository struct {
	created       domain.Booking
	createID      int
	createErr     error
	updatedID     int
	updatedStatus string
}

func (r *fakeRepository) Create(_ context.Context, booking domain.Booking) (int, error) {
	r.created = booking
	return r.createID, r.createErr
}

func (r *fakeRepository) List(context.Context) ([]domain.Booking, error) { return nil, nil }
func (r *fakeRepository) GetBusyTimes(context.Context, time.Time) ([]string, error) {
	return nil, nil
}
func (r *fakeRepository) UpdateStatus(_ context.Context, id int, status string) error {
	r.updatedID, r.updatedStatus = id, status
	return nil
}

type channelNotifier struct{ bookings chan domain.Booking }

func (n channelNotifier) NotifyNewBooking(_ context.Context, booking domain.Booking) {
	n.bookings <- booking
}

func validCreateInput() CreateBookingInput {
	return CreateBookingInput{
		FullName:         "Иван Иванов",
		PhoneNumber:      "+79990000000",
		TelegramUsername: "@example",
		DesiredDate:      "2026-10-10",
		DesiredTime:      "15:30",
		DurationHours:    2,
		RequestDetails:   "Запись вокала",
	}
}

func TestCreateBookingPersistsAndNotifies(t *testing.T) {
	t.Parallel()

	repo := &fakeRepository{createID: 17}
	notifications := make(chan domain.Booking, 1)
	service := NewService(repo, channelNotifier{bookings: notifications})

	id, err := service.CreateBooking(context.Background(), validCreateInput())
	if err != nil {
		t.Fatalf("CreateBooking() error = %v", err)
	}
	if id != 17 {
		t.Fatalf("CreateBooking() id = %d, want 17", id)
	}
	if repo.created.Status != domain.BookingStatusNew || repo.created.DurationHours != 2 {
		t.Fatalf("created booking = %#v", repo.created)
	}

	select {
	case booking := <-notifications:
		if booking.ID != 17 {
			t.Fatalf("notification booking ID = %d, want 17", booking.ID)
		}
	case <-time.After(time.Second):
		t.Fatal("notification was not delivered")
	}
}

func TestCreateBookingValidation(t *testing.T) {
	t.Parallel()

	input := validCreateInput()
	input.PhoneNumber = "8999"
	service := NewService(&fakeRepository{}, nil)

	if _, err := service.CreateBooking(context.Background(), input); err == nil {
		t.Fatal("CreateBooking() accepted invalid input")
	}
}

func TestCreateBookingRejectsUnsupportedTimeBoundary(t *testing.T) {
	t.Parallel()

	input := validCreateInput()
	input.DesiredTime = "15:15"
	service := NewService(&fakeRepository{}, nil)

	if _, err := service.CreateBooking(context.Background(), input); err == nil {
		t.Fatal("CreateBooking() accepted a non-30-minute boundary")
	}
}

func TestCreateBookingPreservesRepositoryErrors(t *testing.T) {
	t.Parallel()

	want := errors.New("conflict")
	service := NewService(&fakeRepository{createErr: want}, nil)
	_, err := service.CreateBooking(context.Background(), validCreateInput())
	if !errors.Is(err, want) {
		t.Fatalf("CreateBooking() error = %v, want %v", err, want)
	}
}

func TestUpdateBookingStatus(t *testing.T) {
	t.Parallel()

	repo := &fakeRepository{}
	service := NewService(repo, nil)
	if err := service.UpdateBookingStatus(context.Background(), 7, "confirmed"); err != nil {
		t.Fatalf("UpdateBookingStatus() error = %v", err)
	}
	if repo.updatedID != 7 || repo.updatedStatus != "confirmed" {
		t.Fatalf("repository update = (%d, %q)", repo.updatedID, repo.updatedStatus)
	}
	if err := service.UpdateBookingStatus(context.Background(), 7, "unknown"); err == nil {
		t.Fatal("UpdateBookingStatus() accepted an invalid status")
	}
}
