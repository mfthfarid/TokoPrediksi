package notification

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewHandler()

	rg.POST("/fcm-token", handler.RegisterToken)
	rg.GET("", handler.GetAll)
	rg.PUT("/:id/read", handler.MarkAsRead)
}