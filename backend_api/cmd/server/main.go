package main

import (
	"log"
	"os"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/user"
)

func main() {
	config.ConnectDB()

	// Auto-migrate — tambahkan model lain di sini nanti (product.Product{}, dll)
	config.DB.AutoMigrate(&user.User{}, product.Product{})

	r := core.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("🚀 Server jalan di port", port)
	r.Run(":" + port)
}