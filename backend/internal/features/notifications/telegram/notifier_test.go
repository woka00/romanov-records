package telegram

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"romanov/backend/internal/core/domain"
	"strings"
	"testing"
	"time"
)

func TestParseChatIDs(t *testing.T) {
	t.Parallel()

	ids := ParseChatIDs("123, invalid, -456")
	if len(ids) != 2 || ids[0] != 123 || ids[1] != -456 {
		t.Fatalf("ParseChatIDs() = %v", ids)
	}
}

func TestFormatBookingMessageEscapesUserInput(t *testing.T) {
	t.Parallel()

	message := formatBookingMessage(domain.Booking{
		ID:          3,
		FullName:    "<Иван & Co>",
		PhoneNumber: "+79990000000",
		DesiredDate: time.Date(2026, time.October, 10, 0, 0, 0, 0, time.UTC),
		DesiredTime: time.Date(0, 1, 1, 15, 30, 0, 0, time.UTC),
	})
	if strings.Contains(message, "<Иван") || !strings.Contains(message, "&lt;Иван &amp; Co&gt;") {
		t.Fatalf("message was not escaped: %s", message)
	}
}

func TestNotifierSendsThroughProtectedRelay(t *testing.T) {
	t.Parallel()

	requests := make(chan sendMessageRequest, 1)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/bot-token/sendMessage" {
			t.Errorf("path = %q", r.URL.Path)
		}
		if got := r.Header.Get("X-Romanov-Relay-Secret"); got != "relay-secret" {
			t.Errorf("relay secret = %q", got)
		}
		var body sendMessageRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Errorf("decode request: %v", err)
		}
		requests <- body
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	notifier := NewWithAPIBaseAndRelaySecret("-token", []int64{123}, server.URL, "relay-secret")
	notifier.NotifyNewBooking(context.Background(), domain.Booking{FullName: "Иван", PhoneNumber: "+79990000000"})

	request := <-requests
	if request.ChatID != 123 || request.ParseMode != "HTML" {
		t.Fatalf("request = %#v", request)
	}
}
