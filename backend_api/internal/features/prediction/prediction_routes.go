package prediction

import "github.com/gin-gonic/gin"

func RegisterRoutes(apiGroup *gin.RouterGroup) {
	handler := NewPredictionHandler()

	apiGroup.GET("/predictions/summary", handler.GetSummary)
	apiGroup.POST("/products/:id/predict", handler.Predict)
	apiGroup.GET("/products/:id/predictions", handler.GetPredictions)
	apiGroup.POST("/predictions/bulk", handler.PredictAll)
}