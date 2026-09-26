package main

import (
	"fmt"
	"log"
	"time"

	"github.com/joho/godotenv"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/prediction"
)

var featuredProductIDs = []uint{159, 43, 246, 127, 76}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
	config.ConnectDB()

	repo := &prediction.PredictionRepository{}

	// Tahap 1: ambil data mentah semua produk dulu, sekalian cari
	allSales := map[uint][]prediction.DailySales{}
	var globalStart, globalEnd time.Time

	for _, productID := range featuredProductIDs {
		sparse, err := repo.GetDailySales(productID)
		if err != nil || len(sparse) == 0 {
			log.Printf("Produk %d: tidak ada data atau error: %v", productID, err)
			continue
		}
		allSales[productID] = sparse

		first, _ := time.Parse("2006-01-02", sparse[0].DS)
		last, _ := time.Parse("2006-01-02", sparse[len(sparse)-1].DS)

		if globalStart.IsZero() || first.Before(globalStart) {
			globalStart = first
		}
		if globalEnd.IsZero() || last.After(globalEnd) {
			globalEnd = last
		}
	}

	fmt.Printf("Rentang gabungan: %s s/d %s (%d hari)\n\n",
		globalStart.Format("2006-01-02"), globalEnd.Format("2006-01-02"),
		int(globalEnd.Sub(globalStart).Hours()/24)+1)

	// Tahap 2: bersihkan data lama, lalu isi ulang pakai rentang yang SAMA untuk semua produk
	config.DB.Exec("DELETE FROM historical_sales_cleaned WHERE product_id IN ?", featuredProductIDs)

	totalInserted := 0
	for _, productID := range featuredProductIDs {
		sparse, ok := allSales[productID]
		if !ok {
			continue
		}

		filled := prediction.FillDateRange(sparse, globalStart, globalEnd)
		realCount, filledCount := 0, 0

		for _, point := range filled {
			err := config.DB.Exec(
				`INSERT INTO historical_sales_cleaned (product_id, sale_date, quantity_sold, is_filled) VALUES (?, ?, ?, ?)`,
				productID, point.DS, point.Y, point.IsFilled,
			).Error
			if err != nil {
				log.Printf("Gagal insert produk %d tanggal %s: %v", productID, point.DS, err)
				continue
			}
			totalInserted++
			if point.IsFilled {
				filledCount++
			} else {
				realCount++
			}
		}

		fmt.Printf("Produk %d: %d hari total (%d data asli, %d hasil pengisian 0)\n",
			productID, len(filled), realCount, filledCount)
	}

	fmt.Printf("\n✅ Selesai. Total %d baris tersimpan di historical_sales_cleaned.\n", totalInserted)
}