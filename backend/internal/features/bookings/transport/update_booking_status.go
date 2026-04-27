package bookings_transport

import (
	"encoding/json"
	"errors"
	"net/http"
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
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateBookingStatus(r.Context(), id, req.Status); err != nil {
		if errors.Is(err, bookings_repository.ErrBookingNotFound) {
			http.Error(w, "booking not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
