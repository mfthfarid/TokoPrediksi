package core

import (
	"log"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/prediction"
	"github.com/robfig/cron/v3"
)

func StartScheduler() {
	c := cron.New()

	// Tiap Minggu jam 01:00 dini hari — jalankan prediksi ulang untuk semua produk
	_, err := c.AddFunc("0 1 * * 0", func() {
		log.Println("⏰ Menjalankan prediksi mingguan terjadwal...")
		service := prediction.NewPredictionService()
		if err := service.PredictAll(14); err != nil { // prediksi 14 hari dari sekarang
			log.Println("Gagal menjalankan prediksi terjadwal:", err)
		}
	})

	if err != nil {
		log.Println("Gagal mendaftarkan jadwal cron:", err)
		return
	}

	c.Start()
	log.Println("✅ Scheduler prediksi mingguan aktif (tiap Minggu 01:00)")
}