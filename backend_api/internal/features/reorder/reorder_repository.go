package reorder

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

const DefaultLeadTimeDays = 3

type Repository struct{}

// GetLeadTime cari lead time dari supplier pembelian TERAKHIR produk ini.
// Kalau tidak ketemu (belum pernah dibeli / supplier belum isi lead time), pakai default.
func (r *Repository) GetLeadTime(productID uint) (days int, source string) {
	var leadTime *int
	config.DB.Table("purchase_items").
		Select("suppliers.lead_time_days").
		Joins("JOIN purchases ON purchases.id = purchase_items.purchase_id").
		Joins("JOIN suppliers ON suppliers.id = purchases.supplier_id").
		Where("purchase_items.product_id = ?", productID).
		Order("purchase_items.id DESC").
		Limit(1).
		Scan(&leadTime)

	if leadTime != nil {
		return *leadTime, "supplier"
	}
	return DefaultLeadTimeDays, "default"
}

func (r *Repository) GetCurrentStock(productID uint) (float64, error) {
	var stock float64
	err := config.DB.Table("products").Select("stock").Where("id = ?", productID).Scan(&stock).Error
	return stock, err
}

type ProductBasicInfo struct {
	ID    uint
	Name  string
	Stock float64
}

func (r *Repository) GetAllActiveProducts() ([]ProductBasicInfo, error) {
	var products []ProductBasicInfo
	err := config.DB.Table("products").
		Select("id, name, stock").
		Where("deleted_at IS NULL").
		Find(&products).Error
	return products, err
}

type PredictionPoint struct {
	PredictedQuantity float64
	YhatUpper         *float64
}

func (r *Repository) GetPredictions(productID uint) ([]PredictionPoint, error) {
	var points []PredictionPoint
	err := config.DB.Table("predictions").
		Select("predicted_quantity, yhat_upper").
		Where("product_id = ?", productID).
		Order("prediction_date ASC").
		Scan(&points).Error
	return points, err
}