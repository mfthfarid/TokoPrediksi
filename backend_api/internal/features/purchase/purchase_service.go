package purchase

import (
	"errors"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type PurchaseService struct {
	repo *PurchaseRepository
}

func NewPurchaseService() *PurchaseService {
	return &PurchaseService{repo: &PurchaseRepository{}}
}

func (s *PurchaseService) GetAll() ([]Purchase, error) {
	return s.repo.FindAll()
}

func (s *PurchaseService) GetByID(id uint) (*Purchase, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("pembelian tidak ditemukan")
	}
	return p, nil
}

func (s *PurchaseService) Create(input CreatePurchaseInput) (*Purchase, error) {
	if len(input.Items) == 0 {
		return nil, errors.New("minimal 1 barang harus diisi")
	}

	var created Purchase

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		header := &Purchase{
			SupplierID:   input.SupplierID,
			PurchaseDate: input.PurchaseDate,
		}
		if err := tx.Create(header).Error; err != nil {
			return err
		}

		var totalAmount uint

		for _, item := range input.Items {
			if item.Quantity.LessThanOrEqual(decimal.NewFromInt(0)) {
				return errors.New("quantity harus lebih besar dari 0")
			}

			// Ambil conversion_to_base dari satuan yang dipilih (misal "Dus" = 132 pcs)
			var pu product.ProductUnit
			if err := tx.First(&pu, item.ProductUnitID).Error; err != nil {
				return errors.New("satuan produk tidak ditemukan")
			}

			quantityBase := item.Quantity.Mul(pu.ConversionToBase)
			if quantityBase.LessThanOrEqual(decimal.NewFromInt(0)) {
				return errors.New("hasil konversi quantity tidak valid")
			}

			subtotalDecimal := decimal.NewFromInt(int64(item.PurchasePrice)).Mul(item.Quantity)
			subtotal := uint(subtotalDecimal.Round(0).IntPart())

			costPerBaseDecimal := subtotalDecimal.Div(quantityBase).Round(0)
			costPerBase := uint(costPerBaseDecimal.IntPart())

			purchaseItem := &PurchaseItem{
				PurchaseID:         header.ID,
				ProductID:          item.ProductID,
				ProductUnitID:      item.ProductUnitID,
				Quantity:           item.Quantity,
				QuantityBase:       quantityBase,
				QuantityRemaining:  quantityBase,
				PurchasePrice:      item.PurchasePrice,
				CostPerBase:        costPerBase,
				TanggalKadaluwarsa: item.TanggalKadaluwarsa,
				Subtotal:           subtotal,
			}
			if err := tx.Create(purchaseItem).Error; err != nil {
				return err
			}

			// Tambah stok produk (SELALU dalam satuan dasar/pcs, konsisten dgn purchase_items.quantity_remaining)
			if err := tx.Model(&product.Product{}).
				Where("id = ?", item.ProductID).
				UpdateColumn("stock", gorm.Expr("stock + ?", quantityBase)).Error; err != nil {
				return err
			}

			totalAmount += subtotal
		}

		header.TotalAmount = totalAmount
		if err := tx.Save(header).Error; err != nil {
			return err
		}

		created = *header
		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.repo.FindByID(created.ID)
}