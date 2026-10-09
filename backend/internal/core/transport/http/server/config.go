package transport_http_server

import (
	"fmt"
	"time"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Addr              string        `envconfig:"ADDR" default:":8080"`
	ShutdownTimeout   time.Duration `envconfig:"SHUTDOWN_TIMEOUT" default:"5s"`
	ReadHeaderTimeout time.Duration `envconfig:"READ_HEADER_TIMEOUT" default:"5s"`
	ReadTimeout       time.Duration `envconfig:"READ_TIMEOUT" default:"10s"`
	WriteTimeout      time.Duration `envconfig:"WRITE_TIMEOUT" default:"15s"`
	IdleTimeout       time.Duration `envconfig:"IDLE_TIMEOUT" default:"60s"`
	CORSOrigin        string        `envconfig:"CORS_ORIGIN" default:"http://localhost:3000"`
}

func NewConfig() (Config, error) {
	var config Config

	if err := envconfig.Process("HTTP", &config); err != nil {
		return Config{}, fmt.Errorf("process envconfig: %w", err)
	}

	return config, nil
}

func NewConfigMust() Config {
	var config Config

	if err := envconfig.Process("HTTP", &config); err != nil {
		err = fmt.Errorf("get HTTP server config: %w", err)
		panic(err)
	}

	return config
}
