package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/category"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/supplier"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/unit"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/user"
	"github.com/shopspring/decimal"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	config.ConnectDB()

	seedOwner()
	seedUnits()
	seedCategories()
	seedSuppliers()
	seedProducts()
	seedProductUnits()
}

// user
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

// Satuan
func seedUnits() {
	defaultUnits := []string{"Pcs", "Renteng", "Pack", "Dus", "Lusin", "Ikat", "Kg"}

	for _, name := range defaultUnits {
		var existing unit.Unit
		if err := config.DB.Where("name = ?", name).First(&existing).Error; err == nil {
			continue // sudah ada, lewati
		}
		config.DB.Create(&unit.Unit{Name: name})
	}
	log.Println("✅ Satuan default berhasil di-seed")
}

// Kategroi
func seedCategories() {
	defaultCategories := []string{"Minuman Sachet", "Makanan Ringan", "Bumbu Dapur"}

	for _, name := range defaultCategories {
		var existing category.Category
		if err := config.DB.Where("name = ?", name).First(&existing).Error; err == nil {
			continue
		}
		config.DB.Create(&category.Category{Name: name})
	}
	log.Println("✅ Kategori default berhasil di-seed")
}

// Supplier
func seedSuppliers() {
	defaultSuppliers := []string{"PT Sumber Makmur Sejahtera"}

	for _, name := range defaultSuppliers {
		var existing supplier.Supplier
		if err := config.DB.Where("name = ?", name).First(&existing).Error; err == nil {
			continue
		}
		phone := "081234567890"
		address := "Jl. Raya Industri No. 123, Jakarta"
		config.DB.Create(&supplier.Supplier{
			Name:    name,
			Phone:   &phone,
			Address: &address,
		})
	}
	log.Println("✅ Supplier default berhasil di-seed")
}

// Produk
func seedProducts() {
	productName := "Kopi Kapal Api 1000"
	var existing product.Product
	if err := config.DB.Where("name = ?", productName).First(&existing).Error; err == nil {
		log.Println("Produk Kopi Kapal Api 1000 sudah ada, dilewati.")
		return
	}

	// Ambil ID kategori "Minuman Sachet" secara dinamis
	var cat category.Category
	if err := config.DB.Where("name = ?", "Minuman Sachet").First(&cat).Error; err != nil {
		log.Fatal("Kategori 'Minuman Sachet' tidak ditemukan, pastikan seedCategories dijalankan lebih dulu.")
	}

	prod := product.Product{
		Name:       productName,
		IDKategori: &cat.ID,
		Stock:      decimal.NewFromInt(0),
	}

	if err := config.DB.Create(&prod).Error; err != nil {
		log.Fatal("Gagal membuat produk:", err)
	}
	log.Println("✅ Produk Kopi Kapal Api 1000 berhasil dibuat")
}

// Satuan produk
func seedProductUnits() {
	// Cari produk "Kopi Kapal Api 1000" untuk mendapatkan ID-nya (biasanya ID = 1 jika baru pertama kali)
	var prod product.Product
	if err := config.DB.Where("name = ?", "Kopi Kapal Api 1000").First(&prod).Error; err != nil {
		log.Println("Produk tidak ditemukan untuk seed product units, dilewati.")
		return
	}

	barcodeRenteng := "098123"
	barcodePcs := "098124" // Dibedakan sedikit agar tidak melanggar aturan uniqueIndex database

	unitsData := []struct {
		unitID           uint
		barcode          *string
		conversionToBase decimal.Decimal
		sellPrice        uint
		isBaseUnit       bool
		isActive         bool
	}{
		{
			unitID:           2, // Renteng
			barcode:          &barcodeRenteng,
			conversionToBase: decimal.NewFromFloat(11.00),
			sellPrice:        10000,
			isBaseUnit:       false,
			isActive:         true,
		},
		{
			unitID:           1, // Pcs
			barcode:          &barcodePcs,
			conversionToBase: decimal.NewFromFloat(1.00),
			sellPrice:        1000,
			isBaseUnit:       true,
			isActive:         true,
		},
	}

	for _, ud := range unitsData {
		var existing product.ProductUnit
		if err := config.DB.Where("product_id = ? AND unit_id = ?", prod.ID, ud.unitID).First(&existing).Error; err == nil {
			continue // sudah ada, lewati
		}

		price := ud.sellPrice
		pu := product.ProductUnit{
			ProductID:        prod.ID,
			UnitID:           ud.unitID,
			Barcode:          ud.barcode,
			ConversionToBase: ud.conversionToBase,
			SellPrice:        &price,
			IsBaseUnit:       ud.isBaseUnit,
			IsActive:         ud.isActive,
		}

		if err := config.DB.Create(&pu).Error; err != nil {
			log.Printf("Gagal membuat product unit untuk unit_id %d: %v", ud.unitID, err)
		}
	}
	log.Println("✅ Product units berhasil di-seed")
}