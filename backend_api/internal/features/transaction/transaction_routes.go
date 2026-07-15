package transaction

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewTransactionHandler()

	rg.GET("", handler.GetTransactions)
	rg.GET("/:id", handler.GetTransaction)
	rg.POST("", handler.AddTransaction)
}