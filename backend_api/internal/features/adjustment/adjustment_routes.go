package adjustment

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewHandler()

	rg.GET("/expiring", handler.GetExpiringBatches)
	rg.GET("/history", handler.GetHistory) // ?product_id=1 untuk riwayat per-produk di Detail Barang
	rg.POST("", handler.Create)
}