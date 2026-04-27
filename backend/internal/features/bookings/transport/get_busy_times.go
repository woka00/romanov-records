package bookings_transport

import (
	"encoding/json"
	"net/http"
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

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(BusyTimesResponse{Busy: times})
}
