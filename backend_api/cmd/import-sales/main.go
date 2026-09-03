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

type barangRow struct {
	Kode       string
	Kategori   string
	Satuan     string
	Harga      int
	NamaProduk string
	Varian     string
	Konversi   float64
}

type unitConversion struct {
	ProductID        uint
	ConversionToBase float64
}

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
	codeToConversion, err := processBarangSheet(f, commit)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("\nTotal kode barang dikenali: %d\n\n", len(codeToConversion))

	if !commit {
		fmt.Println(">>> Tahap A ini baru DRY-RUN. Lanjut cek Tahap B di bawah, lalu jalankan ulang dengan '--commit' kalau sudah yakin.\n")
	}

	// ===== TAHAP B: proses semua sheet tahun =====
	fmt.Println("=== Tahap B: Memproses sheet riwayat penjualan ===")
	sheets := f.GetSheetList()
	totalImported := 0
	unmatchedCodes := map[string]int{}
	skippedRows := 0

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

			uc, found := codeToConversion[kodeBarang]
			if !found {
				unmatchedCodes[kodeBarang]++
				continue
			}

			qty, err := strconv.ParseFloat(jumlahStr, 64)
			if err != nil || qty <= 0 {
				fmt.Printf("  baris %d: jumlah tidak valid (%q), dilewati\n", i+1, jumlahStr)
				skippedRows++
				continue
			}

			var priceTotal int
			if len(row) >= 7 {
				priceTotal = parseRupiah(row[6])
			}

			saleDate, err := parseFlexibleDate(lastDate)
			if err != nil {
				fmt.Printf("  baris %d: tanggal tidak dikenali (%q), dilewati\n", i+1, lastDate)
				skippedRows++
				continue
			}

			quantityBase := qty * uc.ConversionToBase

			if commit {
				err := config.DB.Exec(
					`INSERT INTO historical_sales (product_id, sale_date, quantity_sold, price_sold) VALUES (?, ?, ?, ?)`,
					uc.ProductID, saleDate, quantityBase, priceTotal,
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
	if skippedRows > 0 {
		fmt.Printf("Baris dilewati karena format janggal (tanggal/jumlah): %d\n", skippedRows)
	}

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

func processBarangSheet(f *excelize.File, commit bool) (map[string]unitConversion, error) {
	rows, err := f.GetRows("Barang")
	if err != nil {
		return nil, fmt.Errorf("gagal baca sheet Barang: %w", err)
	}

	// Kolom: Kode(0), Nama Barang(1), Kategori(2), Supplier(3), Satuan(4), Harga(5), Nama Produk(6), Varian(7), Konversi(8)
	groups := map[string][]barangRow{}
	for i, row := range rows {
		if i == 0 || len(row) < 9 {
			continue
		}

		konversi, err := strconv.ParseFloat(strings.TrimSpace(row[8]), 64)
		if err != nil || konversi <= 0 {
			konversi = 1
		}

		br := barangRow{
			Kode:       strings.TrimSpace(row[0]),
			Kategori:   strings.TrimSpace(row[2]),
			Satuan:     strings.TrimSpace(row[4]),
			Harga:      parseRupiah(row[5]),
			NamaProduk: strings.TrimSpace(row[6]),
			Varian:     strings.TrimSpace(row[7]),
			Konversi:   konversi,
		}
		if br.Kode == "" || br.NamaProduk == "" {
			fmt.Printf("  sheet Barang baris %d: Kode/Nama Produk kosong, dilewati\n", i+1)
			continue
		}
		groups[br.NamaProduk] = append(groups[br.NamaProduk], br)
	}

	result := map[string]unitConversion{}

	for nama, items := range groups {
		if len(items) == 1 {
			item := items[0]
			fmt.Printf("[SIMPEL] %q → 1 produk, 1 satuan\n", nama)
			productID := resolveSimpleProduct(nama, item, commit)
			result[item.Kode] = unitConversion{ProductID: productID, ConversionToBase: item.Konversi}
			continue
		}

		fmt.Printf("[MULTI-SATUAN] %q → 1 produk, %d varian jual + 1 satuan dasar tersembunyi\n", nama, len(items))
		productID := resolveMultiUnitProduct(nama, items, commit)
		for _, item := range items {
			result[item.Kode] = unitConversion{ProductID: productID, ConversionToBase: item.Konversi}
		}
	}

	return result, nil
}

func resolveSimpleProduct(nama string, item barangRow, commit bool) uint {
	var productID uint
	config.DB.Table("products").Select("id").Where("name = ?", nama).Scan(&productID)
	if productID > 0 {
		return productID
	}
	if !commit {
		return 999999
	}

	categoryID := findOrCreateCategory(item.Kategori)
	config.DB.Exec(`INSERT INTO products (name, import_code, id_kategori, stock) VALUES (?, ?, ?, 0)`, nama, item.Kode, categoryID)
	config.DB.Table("products").Select("id").Where("name = ?", nama).Scan(&productID)

	unitName := item.Varian
	if unitName == "" {
		unitName = item.Satuan
	}
	unitID := findOrCreateUnit(unitName)
	config.DB.Exec(
		`INSERT INTO product_units (product_id, unit_id, conversion_to_base, sell_price, is_base_unit, is_active) VALUES (?, ?, ?, ?, true, true)`,
		productID, unitID, item.Konversi, item.Harga,
	)
	return productID
}

func resolveMultiUnitProduct(nama string, items []barangRow, commit bool) uint {
	var productID uint
	config.DB.Table("products").Select("id").Where("name = ?", nama).Scan(&productID)
	if productID > 0 {
		return productID
	}
	if !commit {
		return 999999
	}

	categoryID := findOrCreateCategory(items[0].Kategori)
	config.DB.Exec(`INSERT INTO products (name, id_kategori, stock) VALUES (?, ?, 0)`, nama, categoryID)
	config.DB.Table("products").Select("id").Where("name = ?", nama).Scan(&productID)

	// Satuan dasar tersembunyi (gram), tidak dijual langsung — hanya penampung hitungan stok
	gramUnitID := findOrCreateUnit("Gram")
	config.DB.Exec(
		`INSERT INTO product_units (product_id, unit_id, conversion_to_base, is_base_unit, is_active) VALUES (?, ?, 1, true, true)`,
		productID, gramUnitID,
	)

	for _, item := range items {
		unitName := item.Varian
		if unitName == "" {
			unitName = item.Satuan
		}
		unitID := findOrCreateUnit(unitName)
		config.DB.Exec(
			`INSERT INTO product_units (product_id, unit_id, conversion_to_base, sell_price, is_base_unit, is_active) VALUES (?, ?, ?, ?, false, true)`,
			productID, unitID, item.Konversi, item.Harga,
		)
	}
	return productID
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

func parseRupiah(raw string) int {
	cleaned := strings.NewReplacer("Rp", "", ".", "", ",", "", " ", "").Replace(raw)
	val, err := strconv.Atoi(cleaned)
	if err != nil {
		return 0
	}
	return val
}

func parseFlexibleDate(raw string) (string, error) {
	formats := []string{"02/01/2006", "2006-01-02", "1/2/2006", "02-01-06", "01-02-06"}
	for _, layout := range formats {
		if t, err := time.Parse(layout, raw); err == nil {
			return t.Format("2006-01-02"), nil
		}
	}
	return "", fmt.Errorf("format tidak dikenali")
}