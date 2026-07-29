package product

import (
	"errors"
	"fmt"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"gorm.io/gorm"
)

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
		IsActive:         true,
	}

	if input.IsBaseUnit {
		err := config.DB.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(pu).Error; err != nil {
				return err
			}
			return s.repo.UnsetOtherBaseUnits(tx, productID, pu.ID)
		})
		if err != nil {
			return nil, err
		}
		return pu, nil
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

	if input.UnitID != nil {
		pu.UnitID = *input.UnitID
	}
	if input.Barcode != nil {
		pu.Barcode = input.Barcode
	}
	if input.ConversionToBase != nil {
		if input.ConversionToBase.LessThanOrEqual(decimalZero()) {
			return nil, errors.New("conversion_to_base harus lebih besar dari 0")
		}
		pu.ConversionToBase = *input.ConversionToBase
	}
	if input.IsActive != nil {
		pu.IsActive = *input.IsActive
	}

	// Kasus IsBaseUnit butuh penanganan khusus, karena cuma boleh 1 satuan dasar per produk
	if input.IsBaseUnit != nil {
		if *input.IsBaseUnit {
			// Jadikan satuan dasar: unset semua yang lain dulu, baru set ini
			err := config.DB.Transaction(func(tx *gorm.DB) error {
				if err := s.repo.UnsetOtherBaseUnits(tx, pu.ProductID, pu.ID); err != nil {
					return err
				}
				pu.IsBaseUnit = true
				return tx.Save(pu).Error
			})
			if err != nil {
				return nil, err
			}
			return pu, nil
		}

		// Mau melepas status satuan dasar — pastikan ada satuan dasar lain sebagai gantinya
		otherBaseCount, err := s.repo.CountOtherBaseUnits(pu.ProductID, pu.ID)
		if err != nil {
			return nil, err
		}
		if otherBaseCount == 0 {
			return nil, errors.New("harus ada minimal 1 satuan dasar untuk produk ini, jadikan satuan lain sebagai dasar terlebih dahulu")
		}
		pu.IsBaseUnit = false
	}

	if err := s.repo.Update(pu); err != nil {
		return nil, err
	}
	return pu, nil
}

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

func (s *ProductUnitService) GetPriceInfo(unitID uint) (*PriceInfoResponse, error) {
	pu, err := s.repo.FindByID(unitID)
	if err != nil {
		return nil, errors.New("satuan produk tidak ditemukan")
	}

	productRepo := &ProductRepository{}
	costPerBase, err := productRepo.GetLatestCostPerBase(pu.ProductID)
	if err != nil {
		return nil, err
	}

	response := &PriceInfoResponse{
		UnitName:         pu.Unit.Name,
		CostPerBase:      costPerBase,
		CurrentSellPrice: pu.SellPrice,
	}

	if costPerBase != nil {
		costDecimal := decimalFromUint(*costPerBase).Mul(pu.ConversionToBase).Round(0)
		costPerUnit := uint(costDecimal.IntPart())
		response.CostPerUnit = &costPerUnit
	}

	return response, nil
}

func (s *ProductUnitService) DeleteUnit(id uint) error {
	pu, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("satuan produk tidak ditemukan")
	}

	transCount, err := s.repo.CountUsageInTransactions(id)
	if err != nil {
		return err
	}
	purchaseCount, err := s.repo.CountUsageInPurchases(id)
	if err != nil {
		return err
	}
	if transCount > 0 || purchaseCount > 0 {
		return fmt.Errorf("satuan ini sudah pernah dipakai dalam %d transaksi penjualan dan %d riwayat pembelian, tidak dapat dihapus. Nonaktifkan saja satuan ini jika sudah tidak dijual", transCount, purchaseCount)
	}

	if pu.IsBaseUnit {
		return errors.New("satuan dasar tidak dapat dihapus")
	}

	return s.repo.Delete(id)
}