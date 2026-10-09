package bookings_transport

import (
	"net/http"
	transport_http "romanov/backend/internal/core/transport/http"
)

func (h *BookingHTTPHandler) ListBookings(w http.ResponseWriter, r *http.Request) {
	bookings, err := h.service.ListBookings(r.Context())
	if err != nil {
		http.Error(w, "failed to list bookings", http.StatusInternalServerError)
		return
	}

	response := make([]BookingResponse, 0, len(bookings))
	for _, booking := range bookings {
		response = append(response, NewBookingResponse(booking))
	}
	transport_http.WriteJSON(w, http.StatusOK, response)
}
