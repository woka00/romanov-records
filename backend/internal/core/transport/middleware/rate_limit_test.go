package transport_http_middleware

import (
	"testing"
	"time"
)

func TestIPRateLimiter(t *testing.T) {
	t.Parallel()

	limiter := NewIPRateLimiter(2, time.Minute)
	now := time.Date(2026, time.October, 9, 12, 0, 0, 0, time.UTC)

	if allowed, _ := limiter.allow("127.0.0.1", now); !allowed {
		t.Fatal("first request was rejected")
	}
	if allowed, _ := limiter.allow("127.0.0.1", now.Add(time.Second)); !allowed {
		t.Fatal("second request was rejected")
	}
	if allowed, retry := limiter.allow("127.0.0.1", now.Add(2*time.Second)); allowed || retry <= 0 {
		t.Fatalf("third request = (%v, %s), want rejected with retry duration", allowed, retry)
	}
	if allowed, _ := limiter.allow("127.0.0.1", now.Add(time.Minute)); !allowed {
		t.Fatal("request after window reset was rejected")
	}
}
