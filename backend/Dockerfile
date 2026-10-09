FROM golang:1.25-bookworm AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /romanov-backend ./cmd/romanov-app
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /admin-create ./cmd/admin-create
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /healthcheck ./cmd/healthcheck

FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /romanov-backend /romanov-backend
COPY --from=builder /admin-create /admin-create
COPY --from=builder /healthcheck /healthcheck
USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/romanov-backend"]
