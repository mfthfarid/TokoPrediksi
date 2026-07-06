package product

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewProductHandler()

	rg.GET("", handler.GetProducts)
	rg.GET("/:id", handler.GetProduct)
	rg.POST("", handler.AddProduct)
	rg.PUT("/:id", handler.UpdateProduct)
}