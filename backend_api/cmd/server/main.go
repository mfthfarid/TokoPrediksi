package main

// import (
// 	"log"
// 	"os"
// 	"time"

// 	"github.com/gin-gonic/gin"
// 	"github.com/golang-jwt/jwt/v5"
// 	"github.com/joho/godotenv"
// 	"golang.org/x/crypto/bcrypt"
// 	"gorm.io/driver/mysql"
// 	"gorm.io/gorm"
// )

// backend/main.go

import (
	// "backend/config"
	// "backend/routes"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/models"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/routes"

	"log"
	"os"

	"github.com/gin-gonic/gin"
	// "github.com/mfthfarid/TokoPrediksi/backend_api/internal/models"
)

func main() {
	config.ConnectDB()

	// Auto-migrate
	config.DB.AutoMigrate(&models.User{}, &models.Product{})

	r := gin.Default()

	// CORS (untuk React Native)
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Routes
	r.POST("/register", routes.Register)
	r.POST("/login", routes.Login)

	// Products routes
	r.GET("/products", routes.GetProducts)
	r.GET("/products/:id", routes.GetProduct)
	r.POST("/products", routes.AddProduct)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("🚀 Server jalan di port", port)
	r.Run(":" + port)
}