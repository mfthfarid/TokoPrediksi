package product

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type ProductRepository struct{}

func (r *ProductRepository) FindAll() ([]Product, error) {
	var products []Product
	if err := config.DB.Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) FindByID(id uint) (*Product, error) {
	var p Product
	if err := config.DB.First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProductRepository) Create(p *Product) error {
	return config.DB.Create(p).Error
}

func (r *ProductRepository) Update(p *Product) error {
	return config.DB.Save(p).Error
}