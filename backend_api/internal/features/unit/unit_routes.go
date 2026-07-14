package unit

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewUnitHandler()

	rg.GET("", handler.GetUnits)
	rg.GET("/:id", handler.GetUnit)
	rg.POST("", handler.AddUnit)
	rg.PUT("/:id", handler.UpdateUnit)
	rg.DELETE("/:id", handler.DeleteUnit)
}