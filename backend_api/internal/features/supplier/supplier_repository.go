package supplier

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type SupplierRepository struct{}

func (r *SupplierRepository) FindAll() ([]Supplier, error) {
	var suppliers []Supplier
	if err := config.DB.Find(&suppliers).Error; err != nil {
		return nil, err
	}
	return suppliers, nil
}

func (r *SupplierRepository) FindByID(id uint) (*Supplier, error) {
	var s Supplier
	if err := config.DB.First(&s, id).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SupplierRepository) Create(s *Supplier) error {
	return config.DB.Create(s).Error
}

func (r *SupplierRepository) Update(s *Supplier) error {
	return config.DB.Save(s).Error
}

func (r *SupplierRepository) Delete(id uint) error {
	return config.DB.Delete(&Supplier{}, id).Error
}