package auth

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// type RegisterInput struct { ... }  // masih dikomentar sesuai kesepakatan awal

// type ForgotPasswordInput struct {
// 	Email string `json:"email" binding:"required,email"`
// }
//
// type ResetPasswordInput struct {
// 	Token           string `json:"token" binding:"required"`
// 	Password        string `json:"password" binding:"required,min=6"`
// 	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=Password"`
// }