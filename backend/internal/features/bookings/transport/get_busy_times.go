package bookings_transport

import (
	"net/http"
	transport_http "romanov/backend/internal/core/transport/http"
)

func (h *BookingHTTPHandler) GetBusyTimes(w http.ResponseWriter, r *http.Request) {
	date := r.URL.Query().Get("date")
	if date == "" {
		http.Error(w, "query param 'date' required (YYYY-MM-DD)", http.StatusBadRequest)
		return
	}

	times, err := h.service.GetBusyTimes(r.Context(), date)
	if err != nil {
		http.Error(w, "invalid date", http.StatusBadRequest)
		return
	}

	transport_http.WriteJSON(w, http.StatusOK, BusyTimesResponse{Busy: times})
}
