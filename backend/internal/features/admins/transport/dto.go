package admins_transport

type LoginRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type LoginResponse struct {
	ID      int    `json:"id"`
	Session string `json:"session"`
}
