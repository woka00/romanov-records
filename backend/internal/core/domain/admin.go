package domain

import "time"

type Admin struct {
	ID           int
	Login        string
	PasswordHash string
	CreatedAt    time.Time
}
