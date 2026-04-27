package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"romanov/backend/internal/core/domain"
	"strconv"
	"strings"
	"time"
)

const apiBase = "https://api.telegram.org/bot"

type Notifier struct {
	token   string
	chatIDs []int64
	client  *http.Client
}

// New creates a Telegram notifier. If token or chatIDs is empty, the notifier
// becomes a no-op — calls succeed silently. This lets the rest of the system
// run without Telegram configured (e.g. in local dev).
func New(token string, chatIDs []int64) *Notifier {
	return &Notifier{
		token:   token,
		chatIDs: chatIDs,
		client:  &http.Client{Timeout: 10 * time.Second},
	}
}

// ParseChatIDs parses a comma-separated list of int64 chat IDs.
// Empty / unparseable entries are skipped.
func ParseChatIDs(raw string) []int64 {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	ids := make([]int64, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		id, err := strconv.ParseInt(p, 10, 64)
		if err != nil {
			log.Printf("telegram: skipping invalid chat ID %q: %v", p, err)
			continue
		}
		ids = append(ids, id)
	}
	return ids
}

// NotifyNewBooking sends a structured notification about a new booking
// to all configured chat IDs. Errors are logged but do not surface — failure
// to notify must never block booking creation.
func (n *Notifier) NotifyNewBooking(ctx context.Context, b domain.Booking) {
	if n == nil || n.token == "" || len(n.chatIDs) == 0 {
		return
	}

	text := formatBookingMessage(b)
	for _, chatID := range n.chatIDs {
		if err := n.send(ctx, chatID, text); err != nil {
			log.Printf("telegram: send to %d failed: %v", chatID, err)
		}
	}
}

type sendMessageRequest struct {
	ChatID    int64  `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode"`
}

func (n *Notifier) send(ctx context.Context, chatID int64, text string) error {
	payload, err := json.Marshal(sendMessageRequest{
		ChatID:    chatID,
		Text:      text,
		ParseMode: "HTML",
	})
	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}

	url := apiBase + n.token + "/sendMessage"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("post: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("status %d: %s", resp.StatusCode, string(body))
	}
	return nil
}

var ruMonths = [...]string{
	"января", "февраля", "марта", "апреля", "мая", "июня",
	"июля", "августа", "сентября", "октября", "ноября", "декабря",
}

func formatBookingMessage(b domain.Booking) string {
	var sb strings.Builder

	if b.ID > 0 {
		fmt.Fprintf(&sb, "🎙 <b>Новая заявка #%d</b>\n\n", b.ID)
	} else {
		sb.WriteString("🎙 <b>Новая заявка</b>\n\n")
	}

	fmt.Fprintf(&sb, "👤 <b>%s</b>\n", escape(b.FullName))
	fmt.Fprintf(&sb, "📞 %s\n", escape(b.PhoneNumber))
	if b.TelegramUsername != "" {
		fmt.Fprintf(&sb, "✈️ %s\n", escape(b.TelegramUsername))
	}
	sb.WriteString("\n")

	// Sentinel date 1970-01-01 means "remote service, no studio booking".
	if b.DesiredDate.Year() <= 1970 {
		sb.WriteString("🌐 <i>Без записи в студии (удалённая услуга)</i>\n\n")
	} else {
		d := b.DesiredDate
		fmt.Fprintf(&sb, "📅 %d %s %d г.\n", d.Day(), ruMonths[int(d.Month())-1], d.Year())
		fmt.Fprintf(&sb, "🕐 %02d:%02d", b.DesiredTime.Hour(), b.DesiredTime.Minute())
		if b.DurationHours > 0 {
			fmt.Fprintf(&sb, " (%d ч.)", b.DurationHours)
		}
		sb.WriteString("\n\n")
	}

	if b.RequestDetails != "" {
		fmt.Fprintf(&sb, "🎵 %s\n", escape(b.RequestDetails))
	}
	if strings.TrimSpace(b.Comment) != "" {
		fmt.Fprintf(&sb, "\n💬 %s", escape(b.Comment))
	}

	return sb.String()
}

// escape replaces HTML-significant characters so they don't break parse_mode=HTML.
var htmlEscaper = strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;")

func escape(s string) string { return htmlEscaper.Replace(s) }
