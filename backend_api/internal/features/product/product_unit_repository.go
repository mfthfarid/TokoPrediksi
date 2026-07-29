package product

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"gorm.io/gorm"
)

type ProductUnitRepository struct{}

func (r *ProductUnitRepository) FindByID(id uint) (*ProductUnit, error) {
	var pu ProductUnit
	if err := config.DB.Preload("Unit").First(&pu, id).Error; err != nil {
		return nil, err
	}
	return &pu, nil
}

func (r *ProductUnitRepository) FindByProductID(productID uint) ([]ProductUnit, error) {
	var units []ProductUnit
	err := config.DB.Preload("Unit").Where("product_id = ?", productID).Find(&units).Error
	if err != nil {
		return nil, err
	}
	return units, nil
}

func (r *ProductUnitRepository) UnsetOtherBaseUnits(tx *gorm.DB, productID, exceptUnitID uint) error {
	return tx.Model(&ProductUnit{}).
		Where("product_id = ? AND id != ?", productID, exceptUnitID).
		Update("is_base_unit", false).Error
}

func (r *ProductUnitRepository) CountOtherBaseUnits(productID, exceptUnitID uint) (int64, error) {
	var count int64
	err := config.DB.Model(&ProductUnit{}).
		Where("product_id = ? AND id != ? AND is_base_unit = true", productID, exceptUnitID).
		Count(&count).Error
	return count, err
}

func (r *ProductUnitRepository) CountUsageInTransactions(unitID uint) (int64, error) {
	var count int64
	err := config.DB.Table("transaction_items").Where("product_unit_id = ?", unitID).Count(&count).Error
	return count, err
}

func (r *ProductUnitRepository) CountUsageInPurchases(unitID uint) (int64, error) {
	var count int64
	err := config.DB.Table("purchase_items").Where("product_unit_id = ?", unitID).Count(&count).Error
	return count, err
}

func (r *ProductUnitRepository) Create(pu *ProductUnit) error {
	return config.DB.Create(pu).Error
}

func (r *ProductUnitRepository) Update(pu *ProductUnit) error {
	return config.DB.Save(pu).Error
}

func (r *ProductUnitRepository) Delete(id uint) error {
	return config.DB.Delete(&ProductUnit{}, id).Error
}