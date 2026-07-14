package product

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

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

func (r *ProductUnitRepository) Create(pu *ProductUnit) error {
	return config.DB.Create(pu).Error
}

func (r *ProductUnitRepository) Update(pu *ProductUnit) error {
	return config.DB.Save(pu).Error
}

func (r *ProductUnitRepository) Delete(id uint) error {
	return config.DB.Delete(&ProductUnit{}, id).Error
}