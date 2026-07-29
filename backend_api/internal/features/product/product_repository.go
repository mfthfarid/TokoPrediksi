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

// GetLatestCostPerBase ambil cost_per_base dari purchase_items PALING BARU untuk produk ini.
// Sengaja query tabel purchase_items langsung (bukan import package purchase),
// supaya tidak terjadi circular import (purchase sudah import product duluan).
func (r *ProductRepository) GetLatestCostPerBase(productID uint) (*uint, error) {
	var costPerBase uint
	err := config.DB.Table("purchase_items").
		Select("cost_per_base").
		Where("product_id = ?", productID).
		Order("id DESC").
		Limit(1).
		Scan(&costPerBase).Error
	if err != nil {
		return nil, err
	}
	if costPerBase == 0 {
		return nil, nil // belum pernah ada riwayat restok sama sekali
	}
	return &costPerBase, nil
}

func (r *ProductRepository) Delete(id uint) error {
	return config.DB.Delete(&Product{}, id).Error
}