package admins_service

import (
	"context"
	"fmt"

	admins_repository "romanov/backend/internal/features/admins/repository"

	"github.com/go-playground/validator/v10"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo     admins_repository.Repository
	validate *validator.Validate
}

func NewService(repo admins_repository.Repository) *Service {
	return &Service{
		repo:     repo,
		validate: validator.New(),
	}
}

func (s *Service) Login(ctx context.Context, input LoginInput) (int, error) {
	if err := s.validate.Struct(input); err != nil {
		return 0, err
	}

	admin, err := s.repo.GetByLogin(ctx, input.Login)
	if err != nil {
		return 0, fmt.Errorf("invalid login or password")
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(admin.PasswordHash),
		[]byte(input.Password),
	); err != nil {
		return 0, fmt.Errorf("invalid login or password")
	}

	return admin.ID, nil
}
