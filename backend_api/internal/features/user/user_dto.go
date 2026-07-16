package user

type UpdateProfileInput struct {
	Name  *string `json:"name" binding:"omitempty,min=3,max=100"`
	Email *string `json:"email" binding:"omitempty,email"`
}

type UpdatePasswordInput struct {
	OldPassword     string `json:"old_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=NewPassword"`
}