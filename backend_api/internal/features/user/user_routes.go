package user

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewUserHandler()

	rg.GET("/me", handler.GetProfile)
	rg.PUT("/me", handler.UpdateProfile)
	rg.PUT("/me/password", handler.UpdatePassword)
}