package admins_transport

import (
	"encoding/json"
	"net/http"
	adminsession "romanov/backend/internal/core/auth/adminsession"
	"time"

	admins_service "romanov/backend/internal/features/admins/service"
)

type Handler struct {
	service       *admins_service.Service
	sessionSecret string
}

func NewHandler(service *admins_service.Service, sessionSecret string) *Handler {
	return &Handler{
		service:       service,
		sessionSecret: sessionSecret,
	}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(w).Encode(LoginResponse{
		ID:      adminID,
		Session: session,
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
