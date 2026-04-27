package bookings_transport

import (
	"encoding/json"
	"net/http"
	bookings_service "romanov/backend/internal/features/bookings/service"
)

func (h *BookingHTTPHandler) CreateBooking(w http.ResponseWriter, r *http.Request) {
	var req CreateBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	durationHours := req.DurationHours
	if durationHours < 1 {
		durationHours = 1
	}

	input := bookings_service.CreateBookingInput{
		FullName:         req.FullName,
		PhoneNumber:      req.PhoneNumber,
		TelegramUsername: req.TelegramUsername,
		DesiredDate:      req.DesiredDate,
		DesiredTime:      req.DesiredTime,
		DurationHours:    durationHours,
		RequestDetails:   req.RequestDetails,
		Comment:          req.Comment,
	}

	id, err := h.service.CreateBooking(r.Context(), input)
	if err != nil {
		http.Error(w, "failed to create booking", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	_ = json.NewEncoder(w).Encode(CreateBookingResponse{
		ID: id,
	})
}
