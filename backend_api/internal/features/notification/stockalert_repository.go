package notification

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

const lowStockThreshold = 10

type StockAlertRepository struct{}

func (r *StockAlertRepository) GetOutOfStock() ([]string, error) {
	var names []string
	err := config.DB.Table("products").
		Where("stock = 0 AND deleted_at IS NULL").
		Pluck("name", &names).Error
	return names, err
}

func (r *StockAlertRepository) GetLowStock() ([]string, error) {
	return r.GetLowStockExcluding(nil)
}

func (r *StockAlertRepository) GetLowStockExcluding(excludedIDs []uint) ([]string, error) {
	var names []string
	query := config.DB.Table("products").
		Where("stock > 0 AND stock <= ? AND deleted_at IS NULL", lowStockThreshold)
	if len(excludedIDs) > 0 {
		query = query.Where("id NOT IN ?", excludedIDs)
	}
	err := query.Pluck("name", &names).Error
	return names, err
}