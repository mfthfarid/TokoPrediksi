package prediction

import "github.com/gin-gonic/gin"

// RegisterRoutes mendaftarkan semua endpoint yang berhubungan dengan Prediksi
func RegisterRoutes(apiGroup *gin.RouterGroup) {
	handler := NewPredictionHandler()

	// Karena ini menempel pada produk tertentu, kita definisikan path-nya secara eksplisit
	apiGroup.POST("/products/:id/predict", handler.Predict)
	apiGroup.GET("/products/:id/predictions", handler.GetPredictions)

    // 💡 NANTI: Jika Anda membuat endpoint prediksi otomatis massal seperti diskusi sebelumnya,
    // Anda bisa menambahkannya langsung di sini dengan sangat mudah!
	apiGroup.POST("/predictions/bulk", handler.PredictAll)
}