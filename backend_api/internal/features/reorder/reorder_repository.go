package reorder

import (
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
)

type Repository struct{}

type RunInfo struct {
	RunID     string
	CreatedAt time.Time
}

// GetLeadTime: lead time dari supplier pada pembelian terakhir produk ini.
// Kalau tidak ada / belum diisi, pakai default. Minimal 1 hari.
func (r *Repository) GetLeadTime(productID uint) (int, string) {
	var row struct{ LeadTimeDays *int }
	err := config.DB.Table("purchase_items").
		Select("suppliers.lead_time_days AS lead_time_days").
		Joins("JOIN purchases ON purchases.id = purchase_items.purchase_id").
		Joins("JOIN suppliers ON suppliers.id = purchases.supplier_id").
		Where("purchase_items.product_id = ?", productID).
		Order("purchase_items.id DESC").
		Limit(1).
		Scan(&row).Error

	if err == nil && row.LeadTimeDays != nil {
		days := *row.LeadTimeDays
		if days < 1 {
			days = 1
		}
		return days, "supplier"
	}
	return DefaultLeadTimeDays, "default"
}

// FindRunWithMinRows: run terbaru yang masih punya >= minRows hari prediksi setelah hari ini.
func (r *Repository) FindRunWithMinRows(productID uint, minRows int) (string, error) {
	var runID string
	err := config.DB.Raw(`
		SELECT run_id FROM predictions
		WHERE product_id = ? AND prediction_date > CURDATE()
		GROUP BY run_id
		HAVING COUNT(*) >= ?
		ORDER BY MAX(id) DESC
		LIMIT 1`, productID, minRows).Scan(&runID).Error
	return runID, err
}

func (r *Repository) FutureDemand(productID uint, runID string, limit int) ([]float64, error) {
	var vals []float64
	err := config.DB.Table("predictions").
		Where("product_id = ? AND run_id = ? AND prediction_date > CURDATE()", productID, runID).
		Order("prediction_date ASC").
		Limit(limit).
		Pluck("predicted_quantity", &vals).Error
	return vals, err
}

func (r *Repository) FindTParam(productID uint, leadTime int, source string) (*float64, error) {
	var rows []struct{ TValue float64 }
	err := config.DB.Table("reorder_params").
		Select("t_value").
		Where("product_id = ? AND lead_time_days = ? AND service_level_pct = ? AND source = ?",
			productID, leadTime, ServiceLevelPct, source).
		Scan(&rows).Error
	if err != nil || len(rows) == 0 {
		return nil, err
	}
	return &rows[0].TValue, nil
}

func (r *Repository) UpsertTParam(productID uint, leadTime int, source string, t float64, samples int) error {
	return config.DB.Exec(`
		INSERT INTO reorder_params (product_id, lead_time_days, service_level_pct, t_value, source, sample_count)
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE t_value = ?, sample_count = ?, computed_at = CURRENT_TIMESTAMP`,
		productID, leadTime, ServiceLevelPct, t, source, samples, t, samples).Error
}

func (r *Repository) ListRuns(productID uint) ([]RunInfo, error) {
	var runs []RunInfo
	err := config.DB.Raw(`
		SELECT run_id, MIN(created_at) AS created_at
		FROM predictions
		WHERE product_id = ?
		GROUP BY run_id
		ORDER BY MIN(id) ASC`, productID).Scan(&runs).Error
	return runs, err
}

// RunPredictions: prediksi 1 run sebagai map tanggal(YYYY-MM-DD) → jumlah.
func (r *Repository) RunPredictions(productID uint, runID string) (map[string]float64, error) {
	var rows []struct {
		DS  string
		Qty float64
	}
	err := config.DB.Table("predictions").
		Select("DATE_FORMAT(prediction_date, '%Y-%m-%d') AS ds, predicted_quantity AS qty").
		Where("product_id = ? AND run_id = ?", productID, runID).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	m := make(map[string]float64, len(rows))
	for _, row := range rows {
		m[row.DS] = row.Qty
	}
	return m, nil
}