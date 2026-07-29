package purchase

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"gorm.io/gorm"
)

type PurchaseRepository struct{}

func (r *PurchaseRepository) FindAll() ([]Purchase, error) {
	var purchases []Purchase
	err := config.DB.
		Preload("Supplier").
		Preload("Items").
		Preload("Items.Product", func(db *gorm.DB) *gorm.DB { return db.Unscoped() }).
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
		Preload("Items.Product", func(db *gorm.DB) *gorm.DB { return db.Unscoped() }).
		Preload("Items.ProductUnit").
		Preload("Items.ProductUnit.Unit").
		First(&p, id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PurchaseRepository) Delete(id uint) error {
	return config.DB.Delete(&Purchase{}, id).Error
}