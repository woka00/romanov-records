package admins_service

type LoginInput struct {
	Login    string `validate:"required,min=3,max=100"`
	Password string `validate:"required,min=6,max=100"`
}
