package admins_transport

import (
	"net/http"

	transport_http_server "romanov/backend/internal/core/transport/http/server"
)

func (h *Handler) Routes() []transport_http_server.Route {
	return []transport_http_server.Route{
		{
			Method:  http.MethodPost,
			Path:    "/admin/login",
			Handler: http.HandlerFunc(h.Login),
		},
		{
			Method:  http.MethodPost,
			Path:    "/admin/logout",
			Handler: http.HandlerFunc(h.Logout),
		},
	}
}
