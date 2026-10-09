package admins_transport

import (
	"net/http"
	adminsession "romanov/backend/internal/core/auth/adminsession"
	transport_http "romanov/backend/internal/core/transport/http"
	transport_http_middleware "romanov/backend/internal/core/transport/middleware"
	"time"

	admins_service "romanov/backend/internal/features/admins/service"
)

type Handler struct {
	service       *admins_service.Service
	sessionSecret string
	loginLimiter  *transport_http_middleware.IPRateLimiter
}

func NewHandler(service *admins_service.Service, sessionSecret string) *Handler {
	return &Handler{
		service:       service,
		sessionSecret: sessionSecret,
		loginLimiter:  transport_http_middleware.NewIPRateLimiter(5, time.Minute),
	}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	if err := transport_http.DecodeJSON(w, r, &req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	adminID, err := h.service.Login(r.Context(), admins_service.LoginInput{
		Login:    req.Login,
		Password: req.Password,
	})
	if err != nil {
		http.Error(w, "invalid login or password", http.StatusUnauthorized)
		return
	}

	session, expiresAt := adminsession.New(adminID, h.sessionSecret, time.Now())

	http.SetCookie(w, &http.Cookie{
		Name:     adminsession.CookieName,
		Value:    session,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  expiresAt,
	})

	transport_http.WriteJSON(w, http.StatusOK, LoginResponse{
		ID: adminID,
	})
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     adminsession.CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})

	w.WriteHeader(http.StatusNoContent)
}
