package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/xuri/excelize/v2"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Cara pakai: go run cmd/import-sales/main.go <path_excel.xlsx> [--commit]")
	}
	filePath := os.Args[1]
	commit := len(os.Args) > 2 && os.Args[2] == "--commit"

	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
	config.ConnectDB()

	f, err := excelize.OpenFile(filePath)
	if err != nil {
		log.Fatal("Gagal buka file:", err)
	}
	defer f.Close()

	// ===== TAHAP A: proses sheet "Barang" =====
	fmt.Println("=== Tahap A: Memproses sheet Barang ===")
	codeToProductID, err := processBarangSheet(f, commit)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Total produk dikenali: %d\n\n", len(codeToProductID))

	// ===== TAHAP B: proses semua sheet tahun =====
	fmt.Println("=== Tahap B: Memproses sheet riwayat penjualan ===")
	sheets := f.GetSheetList()
	totalImported := 0
	unmatchedCodes := map[string]int{}

	for _, sheetName := range sheets {
		if sheetName == "Barang" {
			continue
		}
		fmt.Printf("\nMemproses sheet: %s\n", sheetName)

		rows, err := f.GetRows(sheetName)
		if err != nil {
			log.Printf("  gagal baca sheet %s: %v", sheetName, err)
			continue
		}

		lastDate := ""
		for i, row := range rows {
			if i == 0 || len(row) < 6 {
				continue // lewati header / baris tidak lengkap
			}

			tanggal := strings.TrimSpace(row[0])
			if tanggal != "" {
				lastDate = tanggal
			}
			if lastDate == "" {
				continue // belum ada tanggal sama sekali di atasnya
			}

			kodeBarang := strings.TrimSpace(row[1])
			jumlahStr := strings.TrimSpace(row[5])

			productID, found := codeToProductID[kodeBarang]
			if !found {
				unmatchedCodes[kodeBarang]++
				continue
			}

			qty, err := strconv.ParseFloat(jumlahStr, 64)
			if err != nil || qty <= 0 {
				continue
			}

			var priceTotal int
			if len(row) >= 7 {
				priceTotal = parseRupiah(row[6])
			}

			saleDate, err := parseFlexibleDate(lastDate)
			if err != nil {
				fmt.Printf("  baris %d: tanggal tidak dikenali (%s), dilewati\n", i+1, lastDate)
				continue
			}

			if commit {
				err := config.DB.Exec(
					`INSERT INTO historical_sales (product_id, sale_date, quantity_sold, price_sold) VALUES (?, ?, ?, ?)`,
					productID, saleDate, qty, priceTotal,
				).Error
				if err != nil {
					log.Printf("  gagal insert baris %d: %v", i+1, err)
					continue
				}
			}
			totalImported++
		}
	}

	fmt.Printf("\n=== HASIL ===\n")
	fmt.Printf("Baris berhasil %s: %d\n", map[bool]string{true: "diimpor", false: "akan diimpor"}[commit], totalImported)

	if len(unmatchedCodes) > 0 {
		fmt.Printf("\nKode Barang TIDAK ditemukan di sheet Barang (%d kode unik, dilewati):\n", len(unmatchedCodes))
		for code, count := range unmatchedCodes {
			fmt.Printf("  - %s (%d baris)\n", code, count)
		}
	}

	if !commit {
		fmt.Println("\n>>> INI BARU DRY-RUN. Tidak ada yang tersimpan.")
		fmt.Println(">>> Kalau hasilnya sudah sesuai, jalankan ulang dengan tambahan '--commit'.")
	} else {
		fmt.Println("\n✅ Import selesai.")
	}
}

func processBarangSheet(f *excelize.File, commit bool) (map[string]uint, error) {
	rows, err := f.GetRows("Barang")
	if err != nil {
		return nil, fmt.Errorf("gagal baca sheet Barang: %w", err)
	}

	result := map[string]uint{}

	for i, row := range rows {
		if i == 0 || len(row) < 6 {
			continue
		}

		kode := strings.TrimSpace(row[0])
		nama := strings.TrimSpace(row[1])
		kategoriNama := strings.TrimSpace(row[2])
		satuanNama := strings.TrimSpace(row[4])
		harga := parseRupiah(row[5])

		if kode == "" || nama == "" {
			continue
		}

		// Cek apakah produk dengan kode ini sudah ada
		var existingID uint
		config.DB.Table("products").Select("id").Where("import_code = ?", kode).Scan(&existingID)
		if existingID > 0 {
			result[kode] = existingID
			continue
		}

		if !commit {
			// dry-run: tandai akan dibuat, tapi belum benar-benar insert
			result[kode] = 999999 // placeholder id, cuma supaya kehitung "dikenali" saat dry-run
			continue
		}

		categoryID := findOrCreateCategory(kategoriNama)
		unitID := findOrCreateUnit(satuanNama)

		productID, err := createProductWithUnit(nama, kode, categoryID, unitID, harga)
		if err != nil {
			log.Printf("  gagal buat produk %s (%s): %v", nama, kode, err)
			continue
		}
		result[kode] = productID
	}

	return result, nil
}

func findOrCreateCategory(name string) *uint {
	if name == "" {
		return nil
	}
	var id uint
	config.DB.Table("categories").Select("id").Where("name = ?", name).Scan(&id)
	if id > 0 {
		return &id
	}
	config.DB.Exec("INSERT INTO categories (name) VALUES (?)", name)
	config.DB.Table("categories").Select("id").Where("name = ?", name).Scan(&id)
	return &id
}

func findOrCreateUnit(name string) uint {
	var id uint
	config.DB.Table("units").Select("id").Where("name = ?", name).Scan(&id)
	if id > 0 {
		return id
	}
	config.DB.Exec("INSERT INTO units (name) VALUES (?)", name)
	config.DB.Table("units").Select("id").Where("name = ?", name).Scan(&id)
	return id
}

func createProductWithUnit(name, importCode string, categoryID *uint, unitID uint, price int) (uint, error) {
	result := config.DB.Exec(
		`INSERT INTO products (name, import_code, id_kategori, stock) VALUES (?, ?, ?, 0)`,
		name, importCode, categoryID,
	)
	if result.Error != nil {
		return 0, result.Error
	}

	var productID uint
	config.DB.Table("products").Select("id").Where("import_code = ?", importCode).Scan(&productID)

	err := config.DB.Exec(
		`INSERT INTO product_units (product_id, unit_id, conversion_to_base, sell_price, is_base_unit, is_active) VALUES (?, ?, 1, ?, true, true)`,
		productID, unitID, price,
	).Error

	return productID, err
}

func parseRupiah(raw string) int {
	cleaned := strings.NewReplacer("Rp", "", ".", "", ",", "", " ", "").Replace(raw)
	val, err := strconv.Atoi(cleaned)
	if err != nil {
		return 0
	}
	return val
}

func parseFlexibleDate(raw string) (string, error) {
	formats := []string{"02/01/2006", "2006-01-02", "1/2/2006"}
	for _, layout := range formats {
		if t, err := time.Parse(layout, raw); err == nil {
			return t.Format("2006-01-02"), nil
		}
	}
	return "", fmt.Errorf("format tidak dikenali")
}