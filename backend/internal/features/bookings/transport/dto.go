package bookings_transport

import (
	"romanov/backend/internal/core/domain"
	"time"
)

type CreateBookingRequest struct {
	FullName         string `json:"full_name"`
	PhoneNumber      string `json:"phone_number"`
	TelegramUsername string `json:"telegram_username"`
	DesiredDate      string `json:"desired_date"`
	DesiredTime      string `json:"desired_time"`
	DurationHours    int    `json:"duration_hours"`
	RequestDetails   string `json:"request_details"`
	Comment          string `json:"comment"`
}

type CreateBookingResponse struct {
	ID int `json:"id"`
}

type BusyTimesResponse struct {
	Busy []string `json:"busy"`
}

type UpdateBookingStatusRequest struct {
	Status string `json:"status"`
}

type BookingResponse struct {
	ID               int                  `json:"id"`
	FullName         string               `json:"full_name"`
	PhoneNumber      string               `json:"phone_number"`
	TelegramUsername string               `json:"telegram_username,omitempty"`
	DesiredDate      string               `json:"desired_date"`
	DesiredTime      string               `json:"desired_time"`
	DurationHours    int                  `json:"duration_hours"`
	RequestDetails   string               `json:"request_details"`
	Comment          string               `json:"comment,omitempty"`
	Status           domain.BookingStatus `json:"status"`
	CreatedAt        time.Time            `json:"created_at"`
	UpdatedAt        time.Time            `json:"updated_at"`
}

func NewBookingResponse(booking domain.Booking) BookingResponse {
	return BookingResponse{
		ID:               booking.ID,
		FullName:         booking.FullName,
		PhoneNumber:      booking.PhoneNumber,
		TelegramUsername: booking.TelegramUsername,
		DesiredDate:      booking.DesiredDate.Format("2006-01-02"),
		DesiredTime:      booking.DesiredTime.Format("15:04"),
		DurationHours:    booking.DurationHours,
		RequestDetails:   booking.RequestDetails,
		Comment:          booking.Comment,
		Status:           booking.Status,
		CreatedAt:        booking.CreatedAt,
		UpdatedAt:        booking.UpdatedAt,
	}
}
