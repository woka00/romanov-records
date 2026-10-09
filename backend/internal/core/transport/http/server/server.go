package transport_http_server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type HTTPServer struct {
	mux            *http.ServeMux
	config         Config
	readinessCheck func(context.Context) error
}

func NewHTTPServer(
	config Config,
) *HTTPServer {
	server := &HTTPServer{
		mux:    http.NewServeMux(),
		config: config,
	}
	server.mux.HandleFunc("GET /healthz", server.health)
	server.mux.HandleFunc("GET /readyz", server.ready)
	return server
}

func (h *HTTPServer) RegisterReadinessCheck(check func(context.Context) error) {
	h.readinessCheck = check
}

func (h *HTTPServer) RegisterAPIRouters(routers ...*APIVersionRouter) {
	for _, router := range routers {
		prefix := "/api/v" + string(router.apiVersion)

		h.mux.Handle(
			prefix+"/",
			http.StripPrefix(prefix, router),
		)
	}
}

func (h *HTTPServer) Run(ctx context.Context) error {
	server := &http.Server{
		Addr:              h.config.Addr,
		Handler:           corsMiddleware(h.config.CORSOrigin)(observabilityMiddleware(h.mux)),
		ReadHeaderTimeout: h.config.ReadHeaderTimeout,
		ReadTimeout:       h.config.ReadTimeout,
		WriteTimeout:      h.config.WriteTimeout,
		IdleTimeout:       h.config.IdleTimeout,
	}

	ch := make(chan error, 1)

	go func() {
		defer close(ch)

		err := server.ListenAndServe()

		if !errors.Is(err, http.ErrServerClosed) {
			ch <- err
		}
	}()

	select {
	case err := <-ch:
		if err != nil {
			return fmt.Errorf("listen and serve: %w", err)
		}
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(
			context.Background(),
			h.config.ShutdownTimeout,
		)

		defer cancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			_ = server.Close()

			return fmt.Errorf("shutdown HTTP server: %w", err)
		}
	}

	return nil
}

func (h *HTTPServer) health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}

func (h *HTTPServer) ready(w http.ResponseWriter, r *http.Request) {
	if h.readinessCheck != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := h.readinessCheck(ctx); err != nil {
			http.Error(w, `{"status":"unavailable"}`, http.StatusServiceUnavailable)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"status":"ready"}`))
}
