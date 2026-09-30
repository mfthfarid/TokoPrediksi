package reorder

import "github.com/gin-gonic/gin"

func RegisterRoutes(apiGroup *gin.RouterGroup) {
	handler := NewHandler()
	apiGroup.GET("/products/:id/reorder-info", handler.GetReorderInfo)
}