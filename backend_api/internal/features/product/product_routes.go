package product

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewProductHandler()
	unitHandler := NewProductUnitHandler()

	rg.GET("", handler.GetProducts)
	rg.GET("/:id", handler.GetProduct)
	rg.POST("", handler.AddProduct)
	rg.PUT("/:id", handler.UpdateProduct)
	rg.POST("/:id/photo", handler.UploadPhoto)
	rg.GET("/scan/:barcode", handler.ScanBarcode)

	rg.GET("/:id/units", unitHandler.GetUnitsByProduct)
	rg.POST("/:id/units", unitHandler.AddUnit)
	rg.PUT("/:id/units/:unitId", unitHandler.UpdateUnit)
	rg.DELETE("/:id/units/:unitId", unitHandler.DeleteUnit)
	rg.PUT("/:id/units/:unitId/price", unitHandler.UpdatePrice)
	rg.GET("/:id/units/:unitId/price-history", unitHandler.GetPriceHistory)
}