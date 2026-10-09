package adminsession

import (
	"strings"
	"testing"
	"time"
)

func TestSessionRoundTrip(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.October, 9, 12, 0, 0, 0, time.UTC)
	token, expiresAt := New(42, strings.Repeat("s", 32), now)

	adminID, ok := Verify(token, strings.Repeat("s", 32), now.Add(time.Hour))
	if !ok || adminID != 42 {
		t.Fatalf("Verify() = (%d, %v), want (42, true)", adminID, ok)
	}
	if want := now.Add(7 * 24 * time.Hour); !expiresAt.Equal(want) {
		t.Fatalf("expiresAt = %s, want %s", expiresAt, want)
	}
}

func TestSessionRejectsInvalidTokens(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.October, 9, 12, 0, 0, 0, time.UTC)
	secret := strings.Repeat("s", 32)
	token, expiresAt := New(42, secret, now)

	tests := map[string]struct {
		token  string
		secret string
		now    time.Time
	}{
		"tampered":     {token: token + "x", secret: secret, now: now},
		"wrong secret": {token: token, secret: strings.Repeat("x", 32), now: now},
		"expired":      {token: token, secret: secret, now: expiresAt},
		"malformed":    {token: "not-a-session", secret: secret, now: now},
	}

	for name, test := range tests {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			if _, ok := Verify(test.token, test.secret, test.now); ok {
				t.Fatal("Verify() accepted an invalid token")
			}
		})
	}
}

func TestSecretFromEnv(t *testing.T) {
	t.Setenv("ADMIN_SESSION_SECRET", "short")
	if _, err := SecretFromEnv(); err != ErrInvalidSecret {
		t.Fatalf("SecretFromEnv() error = %v, want %v", err, ErrInvalidSecret)
	}
}
