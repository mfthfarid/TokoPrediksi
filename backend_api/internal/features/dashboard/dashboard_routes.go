package dashboard

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewDashboardHandler()
	rg.GET("/summary", handler.GetSummary)
}