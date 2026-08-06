package transaction

import (
	"errors"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/purchase"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type TransactionService struct {
	repo *TransactionRepository
}

func NewTransactionService() *TransactionService {
	return &TransactionService{repo: &TransactionRepository{}}
}

func (s *TransactionService) GetAll() ([]Transaction, error) {
	return s.repo.FindAll()
}

func (s *TransactionService) GetByID(id uint) (*Transaction, error) {
	t, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("transaksi tidak ditemukan")
	}
	return t, nil
}

func (s *TransactionService) Create(input CreateTransactionInput) (*Transaction, error) {
	if len(input.Items) == 0 {
		return nil, errors.New("minimal 1 barang harus diisi")
	}

	var created Transaction

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		header := &Transaction{
			TransactionDate: time.Now().Format("2006-01-02"),
			DiscountType:    input.DiscountType,
			DiscountValue:   input.DiscountValue,
		}
		if err := tx.Create(header).Error; err != nil {
			return err
		}

		var totalAmount uint

		for _, item := range input.Items {
			if item.Quantity.LessThanOrEqual(decimal.Zero) {
				return errors.New("quantity harus lebih besar dari 0")
			}

			var pu product.ProductUnit
			if err := tx.First(&pu, item.ProductUnitID).Error; err != nil {
				return errors.New("satuan produk tidak ditemukan")
			}
			if !pu.IsActive {
				return errors.New("satuan ini sudah tidak aktif/dijual")
			}
			if pu.SellPrice == nil {
				return errors.New("satuan ini belum punya harga jual")
			}

			quantityBase := item.Quantity.Mul(pu.ConversionToBase)

			// FIFO reguler: konsumsi dari batch mana saja (expiryDate = nil)
			totalCostPrice, err := purchase.ConsumeStock(tx, item.ProductID, nil, quantityBase)
			if err != nil {
				return err
			}

			// --- PERBAIKAN: Hitung rata-rata harga modal per 1 item satuan ---
			// Karena HPP dari ConsumeStock adalah total keseluruhan, kita bagi dengan Quantity
			perUnitCostDecimal := decimal.NewFromInt(int64(totalCostPrice)).Div(item.Quantity)
			costPricePerItem := uint(perUnitCostDecimal.Round(0).IntPart())
			// -----------------------------------------------------------------

			priceAtSale := *pu.SellPrice
			subtotalDecimal := decimal.NewFromInt(int64(priceAtSale)).Mul(item.Quantity)
			subtotal := uint(subtotalDecimal.Round(0).IntPart())

			transItem := &TransactionItem{
				TransactionID: header.ID,
				ProductID:     item.ProductID,
				ProductUnitID: item.ProductUnitID,
				Quantity:      item.Quantity,
				QuantityBase:  quantityBase,
				PriceAtSale:   priceAtSale,
				CostPrice:     costPricePerItem, // <-- Masukkan harga modal per 1 item di sini
				Subtotal:      subtotal,
			}
			if err := tx.Create(transItem).Error; err != nil {
				return err
			}

			if err := tx.Model(&product.Product{}).
				Where("id = ?", item.ProductID).
				UpdateColumn("stock", gorm.Expr("stock - ?", quantityBase)).Error; err != nil {
				return err
			}

			totalAmount += subtotal
		}

		finalAmount := calculateFinalAmount(totalAmount, input.DiscountType, input.DiscountValue)

		header.TotalAmount = totalAmount
		header.FinalAmount = finalAmount
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

func calculateFinalAmount(totalAmount uint, discountType *DiscountType, discountValue *uint) uint {
	if discountType == nil || discountValue == nil || *discountValue == 0 {
		return totalAmount
	}

	var discount uint
	if *discountType == DiscountNominal {
		discount = *discountValue
	} else {
		discount = totalAmount * (*discountValue) / 100
	}

	if discount >= totalAmount {
		return 0
	}
	return totalAmount - discount
}