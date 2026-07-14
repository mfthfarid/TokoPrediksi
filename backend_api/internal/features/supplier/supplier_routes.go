package supplier

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewSupplierHandler()

	rg.GET("", handler.GetSuppliers)
	rg.GET("/:id", handler.GetSupplier)
	rg.POST("", handler.AddSupplier)
	rg.PUT("/:id", handler.UpdateSupplier)
	rg.DELETE("/:id", handler.DeleteSupplier)
}