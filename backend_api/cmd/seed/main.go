package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/unit"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/user"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	config.ConnectDB()

	seedOwner()
	seedUnits()
}

func seedOwner() {
	email := os.Getenv("OWNER_EMAIL")
	password := os.Getenv("OWNER_PASSWORD")
	name := os.Getenv("OWNER_NAME")

	if email == "" || password == "" || name == "" {
		log.Fatal("OWNER_NAME, OWNER_EMAIL, atau OWNER_PASSWORD belum diatur di .env")
	}

	var existing user.User
	if err := config.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		log.Println("User owner sudah ada, dilewati.")
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		log.Fatal("Gagal hash password:", err)
	}

	owner := user.User{Name: name, Email: email, Password: string(hashed)}
	if err := config.DB.Create(&owner).Error; err != nil {
		log.Fatal("Gagal membuat user owner:", err)
	}
	log.Println("✅ User owner berhasil dibuat:", email)
}

func seedUnits() {
	defaultUnits := []string{"Pcs", "Renteng", "Pack", "Dus", "Lusin", "Kg"}

	for _, name := range defaultUnits {
		var existing unit.Unit
		if err := config.DB.Where("name = ?", name).First(&existing).Error; err == nil {
			continue // sudah ada, lewati
		}
		config.DB.Create(&unit.Unit{Name: name})
	}
	log.Println("✅ Satuan default berhasil di-seed")
}