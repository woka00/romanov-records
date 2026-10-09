package transport_http_middleware

import (
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type clientWindow struct {
	requests int
	resetAt  time.Time
}

type IPRateLimiter struct {
	mu          sync.Mutex
	clients     map[string]clientWindow
	limit       int
	window      time.Duration
	lastCleanup time.Time
}

func NewIPRateLimiter(limit int, window time.Duration) *IPRateLimiter {
	return &IPRateLimiter{
		clients:     make(map[string]clientWindow),
		limit:       limit,
		window:      window,
		lastCleanup: time.Now(),
	}
}

func (l *IPRateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowed, retryAfter := l.allow(clientIP(r), time.Now())
		if !allowed {
			w.Header().Set("Retry-After", strconv.Itoa(max(1, int(retryAfter.Seconds()))))
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (l *IPRateLimiter) allow(key string, now time.Time) (bool, time.Duration) {
	l.mu.Lock()
	defer l.mu.Unlock()

	if now.Sub(l.lastCleanup) >= l.window {
		for client, window := range l.clients {
			if !now.Before(window.resetAt) {
				delete(l.clients, client)
			}
		}
		l.lastCleanup = now
	}

	window, exists := l.clients[key]
	if !exists || !now.Before(window.resetAt) {
		l.clients[key] = clientWindow{requests: 1, resetAt: now.Add(l.window)}
		return true, 0
	}
	if window.requests >= l.limit {
		return false, window.resetAt.Sub(now)
	}

	window.requests++
	l.clients[key] = window
	return true, 0
}

func clientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		return strings.TrimSpace(strings.Split(forwarded, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}
