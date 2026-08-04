package adjustment

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type Repository struct{}

func (r *Repository) GetProductsSimple() ([]ProductSimple, error) {
    var products []ProductSimple
    err := config.DB.Table("products").
        Select("id, name").
        Order("name ASC").
        Scan(&products).Error
        
    return products, err
}

func (r *Repository) GetAvailableBatches(productID uint) ([]BatchOptionDTO, error) {
	var batches []BatchOptionDTO
	err := config.DB.Table("purchase_items").
		Select(`
			id as purchase_item_id,
			DATE_FORMAT(tanggal_kadaluwarsa, '%d/%m/%Y') as tanggal_kadaluwarsa,
			quantity_remaining,
			cost_per_base
		`).
		Where("product_id = ? AND quantity_remaining > 0", productID).
		Order("tanggal_kadaluwarsa ASC").
		Scan(&batches).Error

	if err != nil {
		return nil, err
	}

	return batches, nil
}

func (r *Repository) GetExpiringBatches(search string) ([]ExpiringBatchGroup, error) {
	query := config.DB.Table("purchase_items").
		Select(`
			products.id as product_id,
			products.name as product_name,
			DATE_FORMAT(purchase_items.tanggal_kadaluwarsa, '%d/%m/%Y') as tanggal_kadaluwarsa,
			SUM(purchase_items.quantity_remaining) as total_remaining
		`).
		Joins("JOIN products ON products.id = purchase_items.product_id").
		Where("purchase_items.quantity_remaining > 0 AND purchase_items.tanggal_kadaluwarsa IS NOT NULL").
		Where("purchase_items.tanggal_kadaluwarsa <= DATE_ADD(CURDATE(), INTERVAL 5 MONTH)")

	if search != "" {
		query = query.Where("products.name LIKE ?", "%"+search+"%")
	}

	var results []ExpiringBatchGroup
	err := query.
		Group("products.id, products.name, purchase_items.tanggal_kadaluwarsa").
		Order("purchase_items.tanggal_kadaluwarsa ASC").
		Scan(&results).Error
	return results, err
}

func (r *Repository) Create(a *StockAdjustment) error {
	return config.DB.Create(a).Error
}

func (r *Repository) FindHistory(query HistoryQuery) ([]AdjustmentHistoryRow, error) {
	db := config.DB.Table("stock_adjustments").
		Select(`
			stock_adjustments.id,
			stock_adjustments.product_id,
			products.name as product_name,
			DATE_FORMAT(stock_adjustments.tanggal_kadaluwarsa, '%d/%m/%Y') as tanggal_kadaluwarsa,
			stock_adjustments.quantity_adjusted,
			stock_adjustments.adjustment_type,
			stock_adjustments.estimated_loss,
			stock_adjustments.note,
			DATE_FORMAT(stock_adjustments.created_at, '%d/%m/%Y %H:%i') as created_at
		`).
		Joins("JOIN products ON products.id = stock_adjustments.product_id")

	if query.ProductID != nil {
		db = db.Where("stock_adjustments.product_id = ?", *query.ProductID)
	}
	if query.AdjustmentType != nil {
		db = db.Where("stock_adjustments.adjustment_type = ?", *query.AdjustmentType)
	}
	if query.StartDate != nil && query.EndDate != nil {
		db = db.Where("DATE(stock_adjustments.created_at) BETWEEN ? AND ?", *query.StartDate, *query.EndDate)
	}

	var rows []AdjustmentHistoryRow
	err := db.Order("stock_adjustments.created_at DESC").Scan(&rows).Error
	return rows, err
}