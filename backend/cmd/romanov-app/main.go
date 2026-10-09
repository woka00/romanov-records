package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	adminsession "romanov/backend/internal/core/auth/adminsession"
	"romanov/backend/internal/core/database"
	transport_http_server "romanov/backend/internal/core/transport/http/server"
	admins_repository "romanov/backend/internal/features/admins/repository"
	admins_service "romanov/backend/internal/features/admins/service"
	admins_transport "romanov/backend/internal/features/admins/transport"
	bookings_repository "romanov/backend/internal/features/bookings/repository"
	bookings_service "romanov/backend/internal/features/bookings/service"
	bookings_transport "romanov/backend/internal/features/bookings/transport"
	telegram_notifier "romanov/backend/internal/features/notifications/telegram"
	"syscall"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	ctx, cancel := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT, syscall.SIGTERM,
	)
	defer cancel()

	sessionSecret, err := adminsession.SecretFromEnv()
	if err != nil {
		panic(fmt.Errorf("get admin session secret: %w", err))
	}

	pool, err := database.Open(ctx)
	if err != nil {
		panic(err)
	}
	defer pool.Close()

	tgToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	tgChatIDs := telegram_notifier.ParseChatIDs(os.Getenv("TELEGRAM_NOTIFY_CHAT_IDS"))
	tgAPIBase := os.Getenv("TELEGRAM_API_BASE_URL")
	tgRelaySecret := os.Getenv("TELEGRAM_RELAY_SECRET")
	tgNotifier := telegram_notifier.NewWithAPIBaseAndRelaySecret(tgToken, tgChatIDs, tgAPIBase, tgRelaySecret)
	if tgToken == "" || len(tgChatIDs) == 0 {
		slog.Info("telegram notifier disabled")
	} else {
		slog.Info("telegram notifier ready", "chat_count", len(tgChatIDs))
		if tgAPIBase != "" {
			slog.Info("telegram custom API base configured", "api_base", tgAPIBase)
		}
	}

	bookingRepo := bookings_repository.NewPostgresRepository(pool)
	bookingService := bookings_service.NewService(bookingRepo, tgNotifier)
	bookingTransportHTTP := bookings_transport.NewHandler(bookingService, sessionSecret)

	bookingsRoutes := bookingTransportHTTP.Routes()

	adminRepo := admins_repository.NewPostgresRepository(pool)
	adminService := admins_service.NewService(adminRepo)
	adminTransportHTTP := admins_transport.NewHandler(adminService, sessionSecret)

	adminRoutes := adminTransportHTTP.Routes()

	apiVersionRouter := transport_http_server.NewAPIVersionRouter(transport_http_server.ApiVersion1)
	apiVersionRouter.RegisterRoutes(bookingsRoutes...)
	apiVersionRouter.RegisterRoutes(adminRoutes...)

	httpServer := transport_http_server.NewHTTPServer(
		transport_http_server.NewConfigMust(),
	)
	httpServer.RegisterReadinessCheck(pool.Ping)
	httpServer.RegisterAPIRouters(apiVersionRouter)

	if err := httpServer.Run(ctx); err != nil {
		slog.Error("HTTP server stopped", "error", err)
		os.Exit(1)
	}
}
