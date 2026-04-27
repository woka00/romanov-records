package bookings_transport

import (
	"encoding/json"
	"net/http"
)

func (h *BookingHTTPHandler) ListBookings(w http.ResponseWriter, r *http.Request) {
	bookings, err := h.service.ListBookings(r.Context())
	if err != nil {
		http.Error(w, "failed to list bookings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(bookings)
}
