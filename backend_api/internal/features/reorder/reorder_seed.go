package reorder

import (
	"log"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
)

// Hanya valid untuk lead time 3 hari dan service level 95% (sesuai dokumen serah terima Colab).
var seedT = []struct {
	Name string
	T    float64
}{
	{"Beras", 27680.4},    // gram
	{"Kopi Hitam", 202.6}, // pcs
	{"Mie Goreng", 190.0}, // pcs
	{"Telur", 29189.2},    // gram
	{"Yupi 500", 149.2},   // pcs
}

// EnsureSeedParams idempotent: aman dipanggil tiap server start.
func EnsureSeedParams() {
	for _, s := range seedT {
		var productID uint
		config.DB.Table("products").
			Select("id").
			Where("name = ? AND deleted_at IS NULL", s.Name).
			Scan(&productID)

		if productID == 0 {
			log.Printf("⚠️ seed reorder: produk %q tidak ditemukan, dilewati (cek penulisan nama)\n", s.Name)
			continue
		}

		err := config.DB.Exec(`
			INSERT INTO reorder_params (product_id, lead_time_days, service_level_pct, t_value, source, sample_count)
			VALUES (?, ?, ?, ?, 'seed', 0)
			ON DUPLICATE KEY UPDATE t_value = ?`,
			productID, SeedLeadTimeDays, ServiceLevelPct, s.T, s.T).Error
		if err != nil {
			log.Printf("⚠️ seed reorder produk %q gagal: %v\n", s.Name, err)
		}
	}
}