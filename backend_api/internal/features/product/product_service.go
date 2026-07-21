package product

import (
	"errors"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"gorm.io/gorm"
)

type ProductService struct {
	repo     *ProductRepository
	unitRepo *ProductUnitRepository
}

func NewProductService() *ProductService {
	return &ProductService{repo: &ProductRepository{}, unitRepo: &ProductUnitRepository{}}
}

func (s *ProductService) GetAll() ([]Product, error) {
	return s.repo.FindAll()
}

func (s *ProductService) GetByID(id uint) (*Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}
	return p, nil
}

func (s *ProductService) Create(input CreateProductInput) (*Product, error) {
	baseCount := 0
	for _, u := range input.Units {
		if u.IsBaseUnit {
			baseCount++
		}
		if u.ConversionToBase.LessThanOrEqual(decimalZero()) {
			return nil, errors.New("conversion_to_base harus lebih besar dari 0")
		}
	}
	if baseCount != 1 {
		return nil, errors.New("harus ada tepat 1 satuan dasar (is_base_unit = true)")
	}

	var created Product

	// Pakai DB transaction: kalau salah satu unit gagal disimpan, produk yang baru dibuat ikut dibatalkan (rollback)
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		p := &Product{Name: input.Name, IDKategori: input.IDKategori}
		if err := tx.Create(p).Error; err != nil {
			return err
		}

		for _, u := range input.Units {
			pu := &ProductUnit{
				ProductID:        p.ID,
				UnitID:           u.UnitID,
				Barcode:          u.Barcode,
				ConversionToBase: u.ConversionToBase,
				SellPrice:        u.SellPrice,
				IsBaseUnit:       u.IsBaseUnit,
			}
			if err := tx.Create(pu).Error; err != nil {
				return err
			}
		}

		created = *p
		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.repo.FindByID(created.ID)
}

func (s *ProductService) UpdatePhoto(id uint, photoURL string) (*Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}

	p.PhotoURL = &photoURL
	if err := s.repo.Update(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *ProductService) Update(id uint, input UpdateProductInput) (*Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}

	if input.Name != nil {
		p.Name = *input.Name
	}
	if input.IDKategori != nil {
		p.IDKategori = input.IDKategori
	}

	if err := s.repo.Update(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *ProductService) FindByBarcode(barcode string) (*ProductUnit, error) {
	pu, err := s.repo.FindByBarcode(barcode)
	if err != nil {
		return nil, errors.New("barang dengan barcode ini tidak ditemukan")
	}
	return pu, nil
}