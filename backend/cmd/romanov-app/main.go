package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	adminsession "romanov/backend/internal/core/auth/adminsession"
	transport_http_server "romanov/backend/internal/core/transport/http/server"
	admins_repository "romanov/backend/internal/features/admins/repository"
	admins_service "romanov/backend/internal/features/admins/service"
	admins_transport "romanov/backend/internal/features/admins/transport"
	bookings_repository "romanov/backend/internal/features/bookings/repository"
	bookings_service "romanov/backend/internal/features/bookings/service"
	bookings_transport "romanov/backend/internal/features/bookings/transport"
	telegram_notifier "romanov/backend/internal/features/notifications/telegram"
	"syscall"

	"github.com/jackc/pgx/v5"
)

func main() {
	ctx, cancel := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT, syscall.SIGTERM,
	)
	defer cancel()

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		panic("DATABASE_URL is empty")
	}

	sessionSecret, err := adminsession.SecretFromEnv()
	if err != nil {
		panic(fmt.Errorf("get admin session secret: %w", err))
	}

	conn, err := pgx.Connect(ctx, databaseURL)
	if err != nil {
		panic(fmt.Errorf("connect postgres: %w", err))
	}

	defer conn.Close(ctx)

	tgToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	tgChatIDs := telegram_notifier.ParseChatIDs(os.Getenv("TELEGRAM_NOTIFY_CHAT_IDS"))
	tgNotifier := telegram_notifier.New(tgToken, tgChatIDs)
	if tgToken == "" || len(tgChatIDs) == 0 {
		log.Println("telegram: notifier disabled (TELEGRAM_BOT_TOKEN or TELEGRAM_NOTIFY_CHAT_IDS not set)")
	} else {
		log.Printf("telegram: notifier ready, %d chat(s) configured", len(tgChatIDs))
	}

	bookingRepo := bookings_repository.NewPostgresRepository(conn)
	bookingService := bookings_service.NewService(bookingRepo, tgNotifier)
	bookingTransportHTTP := bookings_transport.NewHandler(bookingService, sessionSecret)

	bookingsRoutes := bookingTransportHTTP.Routes()

	adminRepo := admins_repository.NewPostgresRepository(conn)
	adminService := admins_service.NewService(adminRepo)
	adminTransportHTTP := admins_transport.NewHandler(adminService, sessionSecret)

	adminRoutes := adminTransportHTTP.Routes()

	apiVersionRouter := transport_http_server.NewAPIVersionRouter(transport_http_server.ApiVersion1)
	apiVersionRouter.RegisterRoutes(bookingsRoutes...)
	apiVersionRouter.RegisterRoutes(adminRoutes...)

	httpServer := transport_http_server.NewHTTPServer(
		transport_http_server.NewConfigMust(),
	)
	httpServer.RegisterAPIRouters(apiVersionRouter)

	if err := httpServer.Run(ctx); err != nil {
		fmt.Println(err)
	}
}
