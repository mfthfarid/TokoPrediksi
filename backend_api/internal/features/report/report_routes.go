package report

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewReportHandler()
	rg.GET("/profit", handler.GetProfitReport)
}