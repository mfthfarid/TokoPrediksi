package core

import (
	"fmt"
	"log"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/notification"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/prediction"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/reorder"
	"github.com/robfig/cron/v3"
)

func StartScheduler() {
	c := cron.New()

	// cron mingguan: jalankan prediksi, lalu setelah selesai cek reorder & kirim notifikasi presisi
	_, err := c.AddFunc("0 1 * * 0", func() {
		log.Println("⏰ Menjalankan prediksi mingguan terjadwal...")
		service := prediction.NewPredictionService()
		if err := service.PredictAll(14); err != nil {
			log.Println("Gagal menjalankan prediksi terjadwal:", err)
			return
		}

		// Beri jeda supaya goroutine PredictAll (background) sempat selesai
		// sebelum kita cek reorder — untuk skala 5 produk ini cukup aman.
		time.Sleep(30 * time.Second)
		checkReorderAndNotify()
	})
	if err != nil {
		log.Println("Gagal mendaftarkan jadwal cron prediksi:", err)
	}

	// cron harian
	_, err = c.AddFunc("0 6 * * *", func() {
		log.Println("⏰ Menjalankan pengecekan stok harian...")
		service := notification.NewService()
		service.CheckStockAndNotify()
	})
	if err != nil {
		log.Println("Gagal mendaftarkan jadwal cron stok:", err)
	}

	c.Start()
	log.Println("✅ Scheduler aktif (prediksi mingguan Minggu 01:00, cek stok harian 06:00)")
}

// checkReorderAndNotify dipanggil dari scheduler setelah PredictAll selesai.
// Menggunakan needs_reorder dari reorder.Calculate (lebih presisi dari urgency=="tinggi")
// untuk menentukan produk mana yang perlu diberitahu dalam notifikasi mingguan.
func checkReorderAndNotify() {
	predService := prediction.NewPredictionService()
	reorderService := reorder.NewService()
	notifService := notification.NewService()

	summary, err := predService.GetSummary()
	if err != nil {
		log.Println("[checkReorderAndNotify] Gagal ambil summary prediksi:", err)
		return
	}

	var needReorderNames []string
	successCount := len(summary)
	for _, item := range summary {
		if !item.HasPrediction {
			successCount--
			continue
		}
		info, err := reorderService.Calculate(item.ProductID)
		if err != nil {
			// belum ada prediksi untuk produk ini, lewati
			continue
		}
		if info.NeedsReorder {
			needReorderNames = append(needReorderNames, item.ProductName)
		}
	}

	body := fmt.Sprintf("%d produk berhasil diprediksi.", successCount)
	if len(needReorderNames) > 0 {
		body = fmt.Sprintf("%s %s sudah melewati titik pemesanan ulang, segera restok!", body, formatNameList(needReorderNames))
	}

	notifService.Broadcast("📊 Prediksi Mingguan Selesai", body, "prediction_complete")
}

// formatNameList menggabungkan nama produk jadi ringkasan singkat.
func formatNameList(names []string) string {
	switch len(names) {
	case 0:
		return ""
	case 1:
		return names[0]
	case 2:
		return names[0] + " dan " + names[1]
	default:
		return fmt.Sprintf("%s, %s, dan %d produk lainnya", names[0], names[1], len(names)-2)
	}
}