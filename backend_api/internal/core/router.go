package core

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/middleware"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/auth"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/category"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/dashboard"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/prediction"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/purchase"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/report"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/supplier"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/transaction"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/unit"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/user"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	// r.Static("/uploads", "./uploads")

	auth.RegisterRoutes(r)

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		productGroup := protected.Group("/products")
		product.RegisterRoutes(productGroup)

		predictionHandler := prediction.NewPredictionHandler()
		productGroup.POST("/:id/predict", predictionHandler.Predict)
		productGroup.GET("/:id/predictions", predictionHandler.GetPredictions)

		category.RegisterRoutes(protected.Group("/categories"))
		unit.RegisterRoutes(protected.Group("/units"))
		supplier.RegisterRoutes(protected.Group("/suppliers"))
		purchase.RegisterRoutes(protected.Group("/purchases"))
		transaction.RegisterRoutes(protected.Group("/transactions"))
		user.RegisterRoutes(protected.Group("/users"))
		dashboard.RegisterRoutes(protected.Group("/dashboard"))
		report.RegisterRoutes(protected.Group("/reports"))
	}

	return r
}