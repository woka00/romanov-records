package bookings_transport

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
