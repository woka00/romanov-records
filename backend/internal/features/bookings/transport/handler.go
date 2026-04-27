package bookings_transport

import (
	"net/http"
	transport_http_server "romanov/backend/internal/core/transport/http/server"
	transport_http_middleware "romanov/backend/internal/core/transport/middleware"
	bookings_service "romanov/backend/internal/features/bookings/service"
)

type BookingHTTPHandler struct {
	service       *bookings_service.Service
	sessionSecret string
}

func NewHandler(service *bookings_service.Service, sessionSecret string) *BookingHTTPHandler {
	return &BookingHTTPHandler{
		service:       service,
		sessionSecret: sessionSecret,
	}
}

func (h *BookingHTTPHandler) Routes() []transport_http_server.Route {
	return []transport_http_server.Route{
		{
			Method:  http.MethodPost,
			Path:    "/bookings",
			Handler: http.HandlerFunc(h.CreateBooking),
		},
		{
			Method:  http.MethodGet,
			Path:    "/bookings/busy",
			Handler: http.HandlerFunc(h.GetBusyTimes),
		},
		{
			Method: http.MethodGet,
			Path:   "/admin/bookings",
			Handler: transport_http_middleware.AdminAuth(
				h.sessionSecret,
				http.HandlerFunc(h.ListBookings),
			),
		},
		{
			Method: http.MethodPatch,
			Path:   "/admin/bookings/{id}/status",
			Handler: transport_http_middleware.AdminAuth(
				h.sessionSecret,
				http.HandlerFunc(h.UpdateBookingStatus),
			),
		},
	}
}
