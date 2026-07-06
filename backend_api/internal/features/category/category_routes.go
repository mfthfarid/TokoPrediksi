package category

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup) {
	handler := NewCategoryHandler()

	rg.GET("", handler.GetCategories)
	rg.GET("/:id", handler.GetCategory)
	rg.POST("", handler.AddCategory)
	rg.PUT("/:id", handler.UpdateCategory)
	rg.DELETE("/:id", handler.DeleteCategory)
}