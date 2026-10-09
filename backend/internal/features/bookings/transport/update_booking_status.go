package bookings_transport

import (
	"errors"
	"net/http"
	transport_http "romanov/backend/internal/core/transport/http"
	"strconv"

	bookings_repository "romanov/backend/internal/features/bookings/repository"
)

func (h *BookingHTTPHandler) UpdateBookingStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid booking id", http.StatusBadRequest)
		return
	}

	var req UpdateBookingStatusRequest
	if err := transport_http.DecodeJSON(w, r, &req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateBookingStatus(r.Context(), id, req.Status); err != nil {
		if errors.Is(err, bookings_repository.ErrBookingNotFound) {
			http.Error(w, "booking not found", http.StatusNotFound)
			return
		}
		if errors.Is(err, bookings_repository.ErrBookingConflict) {
			http.Error(w, "booking time conflicts with an existing booking", http.StatusConflict)
			return
		}
		if errors.Is(err, bookings_repository.ErrInvalidTransition) {
			http.Error(w, "invalid booking status transition", http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
