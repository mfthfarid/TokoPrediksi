package purchase

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type PurchaseRepository struct{}

func (r *PurchaseRepository) FindAll() ([]Purchase, error) {
	var purchases []Purchase
	err := config.DB.
		Preload("Supplier").
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.ProductUnit").
		Preload("Items.ProductUnit.Unit").
		Order("purchase_date DESC").
		Find(&purchases).Error
	if err != nil {
		return nil, err
	}
	return purchases, nil
}

func (r *PurchaseRepository) FindByID(id uint) (*Purchase, error) {
	var p Purchase
	err := config.DB.
		Preload("Supplier").
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.ProductUnit").
		Preload("Items.ProductUnit.Unit").
		First(&p, id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}