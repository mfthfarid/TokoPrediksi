package dashboard

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

const lowStockThreshold = 10

type DashboardRepository struct{}

func (r *DashboardRepository) GetTotalSalesToday() (uint, error) {
	var total uint
	err := config.DB.Table("transactions").
		Select("COALESCE(SUM(final_amount), 0)").
		Where("transaction_date = CURDATE()").
		Scan(&total).Error
	return total, err
}

func (r *DashboardRepository) GetTotalTransactionsToday() (int, error) {
	var count int64
	err := config.DB.Table("transactions").
		Where("transaction_date = CURDATE()").
		Count(&count).Error
	return int(count), err
}

func (r *DashboardRepository) GetTotalProfitToday() (int, error) {
	var total float64
	err := config.DB.Table("transaction_items").
		Select("COALESCE(SUM((transaction_items.price_at_sale - transaction_items.cost_price) * transaction_items.quantity), 0)").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.transaction_date = CURDATE()").
		Scan(&total).Error
	return int(total), err
}

func (r *DashboardRepository) GetLowStockProducts() ([]LowStockProduct, error) {
	var products []LowStockProduct
	err := config.DB.Table("products").
		Select("id, name, stock").
		Where("stock <= ?", lowStockThreshold).
		Order("stock ASC").
		Limit(10).
		Scan(&products).Error
	return products, err
}

func (r *DashboardRepository) GetLowStockCount() (int, error) {
	var count int64
	err := config.DB.Table("products").
		Where("stock <= ?", lowStockThreshold).
		Count(&count).Error
	return int(count), err
}

func (r *DashboardRepository) GetTopSellingProducts(limit int) ([]TopSellingProduct, error) {
	var results []TopSellingProduct
	err := config.DB.Table("transaction_items").
		Select("products.id, products.name, SUM(transaction_items.quantity_base) as total_sold").
		Joins("JOIN products ON products.id = transaction_items.product_id").
		Group("products.id, products.name").
		Order("total_sold DESC").
		Limit(limit).
		Scan(&results).Error
	return results, err
}

// GetPredictedStockoutCount menghitung berapa produk yang total prediksi permintaannya
// (ke depan) melebihi stok yang tersedia saat ini — sinyal butuh restok.
func (r *DashboardRepository) GetPredictedStockoutCount() (int, error) {
	var count int64
	err := config.DB.Raw(`
		SELECT COUNT(*) FROM (
			SELECT pred.product_id
			FROM predictions pred
			JOIN products prod ON prod.id = pred.product_id
			WHERE pred.prediction_date >= CURDATE()
			GROUP BY pred.product_id, prod.stock
			HAVING SUM(pred.predicted_quantity) > prod.stock
		) as at_risk
	`).Scan(&count).Error
	return int(count), err
}