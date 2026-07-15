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

			// Ambil satuan (unit) yang dipilih — untuk tahu konversi & harga jual
			var pu product.ProductUnit
			if err := tx.First(&pu, item.ProductUnitID).Error; err != nil {
				return errors.New("satuan produk tidak ditemukan")
			}
			if pu.SellPrice == nil {
				return errors.New("satuan ini belum punya harga jual")
			}

			quantityBase := item.Quantity.Mul(pu.ConversionToBase)

			// Jalankan FIFO: ambil dari purchase_items paling lama dulu
			costPrice, err := consumeStockFIFO(tx, item.ProductID, quantityBase)
			if err != nil {
				return err
			}

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
				CostPrice:     costPrice,
				Subtotal:      subtotal,
			}
			if err := tx.Create(transItem).Error; err != nil {
				return err
			}

			// Kurangi stok produk (SELALU dalam satuan dasar/pcs)
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

// consumeStockFIFO mengambil stok dari purchase_items yang paling lama masuk dulu,
// bisa dari beberapa batch sekaligus kalau 1 batch tidak cukup.
// Return: total modal (cost_price) untuk quantityBase yang diambil.
func consumeStockFIFO(tx *gorm.DB, productID uint, quantityBase decimal.Decimal) (uint, error) {
	var batches []purchase.PurchaseItem
	err := tx.
		Where("product_id = ? AND quantity_remaining > 0", productID).
		Order("purchase_id ASC"). // paling lama masuk duluan (FIFO)
		Find(&batches).Error
	if err != nil {
		return 0, err
	}

	remainingNeeded := quantityBase
	totalCost := decimal.Zero

	for _, batch := range batches {
		if remainingNeeded.LessThanOrEqual(decimal.Zero) {
			break
		}

		taken := decimal.Min(remainingNeeded, batch.QuantityRemaining)
		costForBatch := taken.Mul(decimal.NewFromInt(int64(batch.CostPerBase)))
		totalCost = totalCost.Add(costForBatch)

		newRemaining := batch.QuantityRemaining.Sub(taken)
		if err := tx.Model(&purchase.PurchaseItem{}).
			Where("id = ?", batch.ID).
			UpdateColumn("quantity_remaining", newRemaining).Error; err != nil {
			return 0, err
		}

		remainingNeeded = remainingNeeded.Sub(taken)
	}

	if remainingNeeded.GreaterThan(decimal.Zero) {
		return 0, errors.New("stok tidak cukup untuk produk ini")
	}

	return uint(totalCost.Round(0).IntPart()), nil
}

func calculateFinalAmount(totalAmount uint, discountType *DiscountType, discountValue *uint) uint {
	if discountType == nil || discountValue == nil || *discountValue == 0 {
		return totalAmount
	}

	var discount uint
	if *discountType == DiscountNominal {
		discount = *discountValue
	} else { // percentage
		discount = totalAmount * (*discountValue) / 100
	}

	if discount >= totalAmount {
		return 0
	}
	return totalAmount - discount
}