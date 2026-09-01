package notification

type RegisterTokenInput struct {
	Token string `json:"token" binding:"required"`
}