package prediction

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type DailySales struct {
	DS string  `json:"ds"`
	Y  float64 `json:"y"`
}

type summaryRawRow struct {
	ProductID         uint
	ProductName       string
	CurrentStock      float64
	AverageDailySales float64
	HasPrediction     bool
	BaseUnitName      string
}

type PredictionRepository struct{}

// GetDailySales: gabungan transaksi live + riwayat Excel, dijumlah per tanggal.
func (r *PredictionRepository) GetDailySales(productID uint) ([]DailySales, error) {
	var results []DailySales
	query := `
		SELECT ds, SUM(y) as y FROM (
			SELECT DATE_FORMAT(transactions.transaction_date, '%Y-%m-%d') as ds,
			       transaction_items.quantity_base as y
			FROM transaction_items
			JOIN transactions ON transactions.id = transaction_items.transaction_id
			WHERE transaction_items.product_id = ?

			UNION ALL

			SELECT DATE_FORMAT(sale_date, '%Y-%m-%d') as ds, quantity_sold as y
			FROM historical_sales
			WHERE product_id = ?
		) combined
		GROUP BY ds
		ORDER BY ds ASC
	`
	err := config.DB.Raw(query, productID, productID).Scan(&results).Error
	return results, err
}

func (r *PredictionRepository) GetAllProductIDs() ([]uint, error) {
	var ids []uint
	err := config.DB.Table("products").
		Where("deleted_at IS NULL AND is_prediction_enabled = true").
		Pluck("id", &ids).Error
	if err != nil {
		return nil, err
	}
	return ids, nil
}

func (r *PredictionRepository) IsPredictionEnabled(productID uint) (bool, error) {
	var enabled bool
	err := config.DB.Table("products").
		Select("is_prediction_enabled").
		Where("id = ?", productID).
		Scan(&enabled).Error
	return enabled, err
}

// CreateBatch menyimpan 1 run prediksi. Run lama TIDAK dihapus (dibutuhkan untuk hitung ulang T).
func (r *PredictionRepository) CreateBatch(predictions []Prediction) error {
	if len(predictions) == 0 {
		return nil
	}
	return config.DB.Create(&predictions).Error
}

// LatestRunID mengembalikan run terbaru untuk produk ini ("" bila belum pernah diprediksi).
func (r *PredictionRepository) LatestRunID(productID uint) (string, error) {
	var runID string
	err := config.DB.Table("predictions").
		Select("run_id").
		Where("product_id = ?", productID).
		Order("id DESC").
		Limit(1).
		Scan(&runID).Error
	return runID, err
}

func (r *PredictionRepository) FindLatestRun(productID uint) ([]Prediction, error) {
	runID, err := r.LatestRunID(productID)
	if err != nil || runID == "" {
		return nil, err
	}
	var predictions []Prediction
	err = config.DB.
		Where("product_id = ? AND run_id = ?", productID, runID).
		Order("prediction_date ASC").
		Find(&predictions).Error
	return predictions, err
}

func (r *PredictionRepository) GetProductInfo(productID uint) (string, float64, string, error) {
	type row struct {
		Name     string
		Stock    float64
		UnitName string
	}
	var res row
	err := config.DB.Table("products").
		Select("products.name, products.stock, units.name as unit_name").
		Joins("LEFT JOIN product_units ON product_units.product_id = products.id AND product_units.is_base_unit = true").
		Joins("LEFT JOIN units ON units.id = product_units.unit_id").
		Where("products.id = ?", productID).
		Scan(&res).Error
	return res.Name, res.Stock, res.UnitName, err
}

func (r *PredictionRepository) GetSummaryRaw() ([]summaryRawRow, error) {
	query := `
		SELECT
			p.id as product_id,
			p.name as product_name,
			p.stock as current_stock,
			COALESCE(sales.avg_daily, 0) as average_daily_sales,
			EXISTS(SELECT 1 FROM predictions pr WHERE pr.product_id = p.id) as has_prediction,
			COALESCE(u.name, '') as base_unit_name
		FROM products p
		LEFT JOIN product_units pu ON pu.product_id = p.id AND pu.is_base_unit = true
		LEFT JOIN units u ON u.id = pu.unit_id
		LEFT JOIN (
			SELECT product_id, AVG(y) as avg_daily FROM (
				SELECT transaction_items.product_id,
				       DATE_FORMAT(transactions.transaction_date, '%Y-%m-%d') as ds,
				       SUM(transaction_items.quantity_base) as y
				FROM transaction_items
				JOIN transactions ON transactions.id = transaction_items.transaction_id
				GROUP BY transaction_items.product_id, ds

				UNION ALL

				SELECT product_id, DATE_FORMAT(sale_date, '%Y-%m-%d') as ds, SUM(quantity_sold) as y
				FROM historical_sales
				GROUP BY product_id, ds
			) combined
			GROUP BY product_id
		) sales ON sales.product_id = p.id
		WHERE p.deleted_at IS NULL AND p.is_prediction_enabled = true
	`
	var rows []summaryRawRow
	err := config.DB.Raw(query).Scan(&rows).Error
	return rows, err
}