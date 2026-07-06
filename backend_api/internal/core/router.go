package core

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/middleware"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/auth"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	// Route publik (tanpa login)
	auth.RegisterRoutes(r)

	// Route yang wajib login
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		product.RegisterRoutes(protected.Group("/products"))
		// prediksi.RegisterRoutes(protected.Group("/prediksi"))
	}

	return r
}