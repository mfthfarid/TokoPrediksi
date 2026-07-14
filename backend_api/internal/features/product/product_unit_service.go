package product

import "errors"

type ProductUnitService struct {
	repo      *ProductUnitRepository
	priceRepo *PriceHistoryRepository
}

func NewProductUnitService() *ProductUnitService {
	return &ProductUnitService{repo: &ProductUnitRepository{}, priceRepo: &PriceHistoryRepository{}}
}

func (s *ProductUnitService) GetByProductID(productID uint) ([]ProductUnit, error) {
	return s.repo.FindByProductID(productID)
}

func (s *ProductUnitService) AddUnit(productID uint, input AddProductUnitInput) (*ProductUnit, error) {
	if input.ConversionToBase.LessThanOrEqual(decimalZero()) {
		return nil, errors.New("conversion_to_base harus lebih besar dari 0")
	}

	pu := &ProductUnit{
		ProductID:        productID,
		UnitID:           input.UnitID,
		Barcode:          input.Barcode,
		ConversionToBase: input.ConversionToBase,
		SellPrice:        input.SellPrice,
		IsBaseUnit:       input.IsBaseUnit,
	}
	if err := s.repo.Create(pu); err != nil {
		return nil, err
	}
	return pu, nil
}

func (s *ProductUnitService) UpdateUnit(id uint, input UpdateProductUnitInput) (*ProductUnit, error) {
	pu, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("satuan produk tidak ditemukan")
	}

	if input.Barcode != nil {
		pu.Barcode = input.Barcode
	}
	if input.ConversionToBase != nil {
		pu.ConversionToBase = *input.ConversionToBase
	}

	if err := s.repo.Update(pu); err != nil {
		return nil, err
	}
	return pu, nil
}

// changedBy nullable dulu (belum ambil dari JWT claims), diisi setelah middleware auth simpan user_id ke context
func (s *ProductUnitService) UpdatePrice(id uint, input UpdatePriceInput, changedBy *uint) (*ProductUnit, error) {
	pu, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("satuan produk tidak ditemukan")
	}

	history := &PriceHistory{
		ProductUnitID: pu.ID,
		OldPrice:      pu.SellPrice,
		NewPrice:      input.NewPrice,
		ChangedBy:     changedBy,
	}
	if err := s.priceRepo.Create(history); err != nil {
		return nil, err
	}

	pu.SellPrice = &input.NewPrice
	if err := s.repo.Update(pu); err != nil {
		return nil, err
	}
	return pu, nil
}

func (s *ProductUnitService) GetPriceHistory(productUnitID uint) ([]PriceHistory, error) {
	return s.priceRepo.FindByProductUnitID(productUnitID)
}

func (s *ProductUnitService) DeleteUnit(id uint) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("satuan produk tidak ditemukan")
	}
	return s.repo.Delete(id)
}