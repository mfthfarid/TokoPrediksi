package prediction

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type DailySales struct {
	DS string  `json:"ds"`
	Y  float64 `json:"y"`
}

type PredictionRepository struct{}

// GetDailySales mengagregasi transaction_items → total terjual per hari per produk.
// DATE_FORMAT dipakai supaya hasilnya pasti string "YYYY-MM-DD", bukan time.Time
// (MySQL DATE column otomatis jadi time.Time kalau tidak diformat manual, dan itu
// tidak bisa langsung di-scan ke field string tanpa konversi eksplisit).
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
	
	// Gunakan Pluck untuk efisiensi memori (hanya menarik kolom ID)
	err := config.DB.Table("products").
		Where("deleted_at IS NULL"). // (Opsional) Memastikan produk yang sudah di-soft-delete tidak ikut diprediksi
		Pluck("id", &ids).Error

	if err != nil {
		return nil, err
	}
	return ids, nil
}

func (r *PredictionRepository) DeleteByProductID(productID uint) error {
	return config.DB.Where("product_id = ?", productID).Delete(&Prediction{}).Error
}

func (r *PredictionRepository) CreateBatch(predictions []Prediction) error {
	if len(predictions) == 0 {
		return nil
	}
	return config.DB.Create(&predictions).Error
}

func (r *PredictionRepository) FindByProductID(productID uint) ([]Prediction, error) {
	var predictions []Prediction
	err := config.DB.
		Where("product_id = ?", productID).
		Order("prediction_date ASC").
		Find(&predictions).Error
	if err != nil {
		return nil, err
	}
	return predictions, nil
}

func (r *PredictionRepository) GetProductInfo(productID uint) (string, float64, error) {
	type row struct {
		Name  string
		Stock float64
	}
	var res row
	err := config.DB.Table("products").
		Select("name, stock").
		Where("id = ?", productID).
		Scan(&res).Error
	return res.Name, res.Stock, err
}