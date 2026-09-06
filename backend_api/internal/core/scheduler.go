package core

import (
	"log"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/notification"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/prediction"
	"github.com/robfig/cron/v3"
)

func StartScheduler() {
	c := cron.New()

	// cron mingguan
	_, err := c.AddFunc("0 1 * * 0", func() {
		log.Println("⏰ Menjalankan prediksi mingguan terjadwal...")
		service := prediction.NewPredictionService()
		if err := service.PredictAll(14); err != nil {
			log.Println("Gagal menjalankan prediksi terjadwal:", err)
		}
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