package transport_http_middleware

import (
	"net/http"
	adminsession "romanov/backend/internal/core/auth/adminsession"
	"time"
)

func AdminAuth(sessionSecret string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(adminsession.CookieName)
		if err != nil || cookie.Value == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		if _, ok := adminsession.Verify(cookie.Value, sessionSecret, time.Now()); !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
