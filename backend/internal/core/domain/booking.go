package domain

import "time"

type BookingStatus string

const (
	BookingStatusNew       BookingStatus = "new"
	BookingStatusConfirmed BookingStatus = "confirmed"
	BookingStatusCompleted BookingStatus = "completed"
	BookingStatusCancelled BookingStatus = "cancelled"
)

func (s BookingStatus) IsValid() bool {
	switch s {
	case BookingStatusNew, BookingStatusConfirmed, BookingStatusCompleted, BookingStatusCancelled:
		return true
	default:
		return false
	}
}

func (s BookingStatus) CanTransitionTo(next BookingStatus) bool {
	switch s {
	case BookingStatusNew:
		return next == BookingStatusConfirmed || next == BookingStatusCompleted || next == BookingStatusCancelled
	case BookingStatusConfirmed:
		return next == BookingStatusNew || next == BookingStatusCompleted || next == BookingStatusCancelled
	case BookingStatusCompleted, BookingStatusCancelled:
		return next == BookingStatusNew
	default:
		return false
	}
}

type Booking struct {
	ID               int
	FullName         string
	PhoneNumber      string
	TelegramUsername string
	DesiredDate      time.Time
	DesiredTime      time.Time
	DurationHours    int
	RequestDetails   string
	Comment          string
	Status           BookingStatus
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
