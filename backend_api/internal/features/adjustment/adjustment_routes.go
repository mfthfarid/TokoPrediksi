package adjustment

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewHandler()

	rg.GET("/products", handler.GetProductsSimple)
	rg.GET("/batches/:productId", handler.GetAvailableBatches)
	rg.GET("/expiring", handler.GetExpiringBatches)
	rg.GET("/history", handler.GetHistory)
	rg.POST("", handler.Create)
}