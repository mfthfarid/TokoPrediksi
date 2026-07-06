package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/user"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// godotenv.Load() dipanggil dua kali (di sini & di ConnectDB) tidak masalah,
	// aman karena cuma baca file .env ke environment variable
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	config.ConnectDB()

	email := os.Getenv("OWNER_EMAIL")
	password := os.Getenv("OWNER_PASSWORD")

	if email == "" || password == "" {
		log.Fatal("OWNER_EMAIL atau OWNER_PASSWORD belum diatur di .env")
	}

	var existing user.User
	if err := config.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		log.Println("User owner sudah ada, seeding dilewati.")
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		log.Fatal("Gagal hash password:", err)
	}

	owner := user.User{Email: email, Password: string(hashed)}
	if err := config.DB.Create(&owner).Error; err != nil {
		log.Fatal("Gagal membuat user owner:", err)
	}

	log.Println("✅ User owner berhasil dibuat:", email)
}