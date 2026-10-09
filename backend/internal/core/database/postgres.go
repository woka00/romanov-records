package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	URL               string        `envconfig:"URL" required:"true"`
	MaxConnections    int32         `envconfig:"MAX_CONNECTIONS" default:"10"`
	MinConnections    int32         `envconfig:"MIN_CONNECTIONS" default:"2"`
	MaxConnectionIdle time.Duration `envconfig:"MAX_CONNECTION_IDLE" default:"5m"`
	MaxConnectionLife time.Duration `envconfig:"MAX_CONNECTION_LIFETIME" default:"1h"`
}

func Open(ctx context.Context) (*pgxpool.Pool, error) {
	var config Config
	if err := envconfig.Process("DATABASE", &config); err != nil {
		return nil, fmt.Errorf("load database config: %w", err)
	}

	poolConfig, err := pgxpool.ParseConfig(config.URL)
	if err != nil {
		return nil, fmt.Errorf("parse database config: %w", err)
	}

	poolConfig.MaxConns = config.MaxConnections
	poolConfig.MinConns = config.MinConnections
	poolConfig.MaxConnIdleTime = config.MaxConnectionIdle
	poolConfig.MaxConnLifetime = config.MaxConnectionLife
	poolConfig.HealthCheckPeriod = time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("create database pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return pool, nil
}
