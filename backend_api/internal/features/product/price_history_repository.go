package product

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type PriceHistoryRepository struct{}

func (r *PriceHistoryRepository) FindByProductUnitID(productUnitID uint) ([]PriceHistory, error) {
	var histories []PriceHistory
	err := config.DB.
		Where("product_unit_id = ?", productUnitID).
		Order("changed_at DESC").
		Find(&histories).Error
	if err != nil {
		return nil, err
	}
	return histories, nil
}

func (r *PriceHistoryRepository) Create(h *PriceHistory) error {
	return config.DB.Create(h).Error
}