package adminsession

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

const (
	CookieName = "admin_session"
	ttl        = 7 * 24 * time.Hour
)

var (
	ErrMissingSecret = errors.New("ADMIN_SESSION_SECRET is empty")
	ErrInvalidSecret = errors.New("ADMIN_SESSION_SECRET must be at least 32 characters")
)

func SecretFromEnv() (string, error) {
	secret := os.Getenv("ADMIN_SESSION_SECRET")
	if secret == "" {
		return "", ErrMissingSecret
	}
	if len(secret) < 32 {
		return "", ErrInvalidSecret
	}
	return secret, nil
}

func New(adminID int, secret string, now time.Time) (string, time.Time) {
	expiresAt := now.Add(ttl)
	payload := fmt.Sprintf("%d.%d", adminID, expiresAt.Unix())
	signature := sign(payload, secret)
	return payload + "." + signature, expiresAt
}

func Verify(token string, secret string, now time.Time) (int, bool) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return 0, false
	}

	adminID, err := strconv.Atoi(parts[0])
	if err != nil || adminID <= 0 {
		return 0, false
	}

	expiresUnix, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return 0, false
	}
	if !now.Before(time.Unix(expiresUnix, 0)) {
		return 0, false
	}

	payload := parts[0] + "." + parts[1]
	expected := sign(payload, secret)
	if !hmac.Equal([]byte(parts[2]), []byte(expected)) {
		return 0, false
	}

	return adminID, true
}

func sign(payload string, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
