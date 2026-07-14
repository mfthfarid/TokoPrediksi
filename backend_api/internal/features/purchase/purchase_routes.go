package purchase

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewPurchaseHandler()

	rg.GET("", handler.GetPurchases)
	rg.GET("/:id", handler.GetPurchase)
	rg.POST("", handler.AddPurchase)
}