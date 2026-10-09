package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	login := strings.TrimSpace(os.Getenv("ADMIN_LOGIN"))
	password := os.Getenv("ADMIN_PASSWORD")
	databaseURL := os.Getenv("DATABASE_URL")

	if login == "" || len(password) < 12 || databaseURL == "" {
		fmt.Fprintln(os.Stderr, "ADMIN_LOGIN, ADMIN_PASSWORD (12+ characters) and DATABASE_URL are required")
		os.Exit(2)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic(fmt.Errorf("hash password: %w", err))
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, databaseURL)
	if err != nil {
		panic(fmt.Errorf("connect database: %w", err))
	}
	defer conn.Close(ctx)

	const query = `
		INSERT INTO romanov.admins (login, password_hash)
		VALUES ($1, $2)
		ON CONFLICT (login) DO UPDATE SET password_hash = EXCLUDED.password_hash
	`
	if _, err := conn.Exec(ctx, query, login, string(hash)); err != nil {
		panic(fmt.Errorf("upsert administrator: %w", err))
	}

	fmt.Printf("administrator %q is ready\n", login)
}
