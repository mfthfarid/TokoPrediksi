package auth

import "github.com/gin-gonic/gin"

func RegisterRoutes(r *gin.Engine) {
	handler := NewAuthHandler()

	g := r.Group("/auth")
	{
		// g.POST("/register", handler.Register) //
		g.POST("/login", handler.Login)
		g.POST("/forgot-password", handler.ForgotPassword)
		g.POST("/reset-password", handler.ResetPassword)
	}
}