package product

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type ProductRepository struct{}

func (r *ProductRepository) FindAll() ([]Product, error) {
	var products []Product
	err := config.DB.
		Preload("Kategori").
		Preload("Units").
		Preload("Units.Unit").
		Find(&products).Error
	if err != nil {
		return nil, err
	}

	for i := range products {
		products[i].PopulatePhotoURLs()
	}
	return products, nil
}

func (r *ProductRepository) FindByID(id uint) (*Product, error) {
	var p Product
	err := config.DB.
		Preload("Kategori").
		Preload("Units").
		Preload("Units.Unit").
		First(&p, id).Error
	if err != nil {
		return nil, err
	}

	p.PopulatePhotoURLs()
	return &p, nil
}

func (r *ProductRepository) Create(p *Product) error {
	return config.DB.Create(p).Error
}

func (r *ProductRepository) Update(p *Product) error {
	return config.DB.Save(p).Error
}

func (r *ProductRepository) FindByBarcode(barcode string) (*ProductUnit, error) {
	var pu ProductUnit
	err := config.DB.
		Preload("Unit").
		Where("barcode = ?", barcode).
		First(&pu).Error
	if err != nil {
		return nil, err
	}
	return &pu, nil
}