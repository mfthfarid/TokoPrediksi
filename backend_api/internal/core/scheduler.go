package core

import (
	"fmt"
	"log"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/notification"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/prediction"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/reorder"
	"github.com/robfig/cron/v3"
)

func StartScheduler() {
	c := cron.New()

	// Mingguan: prediksi (sinkron) → hitung ulang T → notifikasi ringkasan
	_, err := c.AddFunc("0 1 * * 0", runWeeklyPipeline)
	if err != nil {
		log.Println("Gagal mendaftarkan jadwal cron prediksi:", err)
	}

	// Harian: cek stok habis, safety stock, reorder point, dan stok menipis
	_, err = c.AddFunc("0 6 * * *", func() {
		log.Println("⏰ Menjalankan pengecekan stok harian...")
		notification.NewService().CheckStockAndNotify()
	})
	if err != nil {
		log.Println("Gagal mendaftarkan jadwal cron stok:", err)
	}

	c.Start()
	log.Println("✅ Scheduler aktif (prediksi + hitung ulang T: Minggu 01:00, cek stok harian 06:00)")
}

func runWeeklyPipeline() {
	log.Println("⏰ Menjalankan prediksi mingguan terjadwal...")

	success, failed, err := prediction.NewPredictionService().PredictAllSync(14)
	if err != nil {
		log.Println("Gagal menjalankan prediksi terjadwal:", err)
		return
	}

	reorderService := reorder.NewService()
	updatedT := reorderService.RecomputeAllT()
	log.Printf("Prediksi selesai (berhasil %d, gagal %d). T dihitung ulang untuk %d produk.\n", success, failed, updatedT)

	var needReorderNames []string
	if items, err := reorderService.CalculateAll(); err == nil {
		for _, it := range items {
			if it.Status == "below_rop" {
				needReorderNames = append(needReorderNames, it.ProductName)
			}
		}
	}

	body := fmt.Sprintf("%d produk berhasil diprediksi.", success)
	if failed > 0 {
		body = fmt.Sprintf("%s %d produk gagal.", body, failed)
	}
	if len(needReorderNames) > 0 {
		body = fmt.Sprintf("%s %s sudah melewati titik pemesanan ulang, segera restok!", body, formatNameList(needReorderNames))
	}

	notification.NewService().Broadcast("📊 Prediksi Mingguan Selesai", body, "prediction_complete")
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