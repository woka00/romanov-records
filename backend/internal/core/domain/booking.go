package domain

import "time"

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
	Status           string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
