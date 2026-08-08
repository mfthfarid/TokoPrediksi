package transaction

import (
	"errors"
	"fmt"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/purchase"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type TransactionService struct {
	repo *TransactionRepository
}

func NewTransactionService() *TransactionService {
	return &TransactionService{repo: &TransactionRepository{}}
}

func (s *TransactionService) GetAll(query TransactionQuery) ([]Transaction, error) {
	var startDate string
	var endDate string

	if query.StartDate != "" {
		start, err := time.Parse("2006-01-02", query.StartDate)
		if err != nil {
			return nil, errors.New("format start_date harus YYYY-MM-DD")
		}

		startDate = start.Format("2006-01-02 00:00:00")
	}

	if query.EndDate != "" {
		end, err := time.Parse("2006-01-02", query.EndDate)
		if err != nil {
			return nil, errors.New("format end_date harus YYYY-MM-DD")
		}

		// Tambahkan 1 hari agar seluruh tanggal end_date ikut masuk.
		end = end.AddDate(0, 0, 1)
		endDate = end.Format("2006-01-02 00:00:00")
	}

	if startDate != "" && endDate != "" && startDate >= endDate {
		return nil, errors.New("start_date harus sebelum end_date")
	}

	return s.repo.FindAll(startDate, endDate)
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
		// Generate Transaction Code
		now := time.Now()
		trxCode := fmt.Sprintf(
			"TRX-%s-%d",
			now.Format("20060102"),
			now.Unix(),
		)

		header := &Transaction{
			TransactionCode: trxCode,
			TransactionDate: customtype.DateTime{Time: now},
			DiscountType:    input.DiscountType,
			DiscountValue:   input.DiscountValue,
		}

		if err := tx.Create(header).Error; err != nil {
			return err
		}

		var totalAmount uint

		// REVISI:
		// Total quantity menggunakan decimal agar bisa menyimpan
		// nilai pecahan seperti 1.5, 2.25, dan sebagainya.
		var totalQuantity = decimal.Zero

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

			// FIFO reguler: konsumsi dari batch mana saja
			totalCostPrice, err := purchase.ConsumeStock(
				tx,
				item.ProductID,
				nil,
				quantityBase,
			)
			if err != nil {
				return err
			}

			// Hitung rata-rata harga modal per 1 item satuan
			perUnitCostDecimal := decimal.NewFromInt(
				int64(totalCostPrice),
			).Div(item.Quantity)

			costPricePerItem := uint(
				perUnitCostDecimal.Round(0).IntPart(),
			)

			priceAtSale := *pu.SellPrice

			subtotalDecimal := decimal.NewFromInt(
				int64(priceAtSale),
			).Mul(item.Quantity)

			subtotal := uint(
				subtotalDecimal.Round(0).IntPart(),
			)

			transItem := &TransactionItem{
				TransactionID: header.ID,
				ProductID:     item.ProductID,
				ProductUnitID: item.ProductUnitID,
				Quantity:      item.Quantity,
				QuantityBase:  quantityBase,
				PriceAtSale:   priceAtSale,
				CostPrice:     costPricePerItem,
				Subtotal:      subtotal,
			}

			if err := tx.Create(transItem).Error; err != nil {
				return err
			}

			if err := tx.Model(&product.Product{}).
				Where("id = ?", item.ProductID).
				UpdateColumn(
					"stock",
					gorm.Expr("stock - ?", quantityBase),
				).Error; err != nil {
				return err
			}

			// Total harga
			totalAmount += subtotal

			// REVISI:
			// Tambahkan quantity menggunakan decimal.
			// Jangan gunakan IntPart() karena akan membuang nilai pecahan.
			totalQuantity = totalQuantity.Add(item.Quantity)
		}

		finalAmount := calculateFinalAmount(
			totalAmount,
			input.DiscountType,
			input.DiscountValue,
		)

		header.TotalAmount = totalAmount
		header.FinalAmount = finalAmount

		// REVISI:
		// Sekarang TotalQuantity bertipe decimal.Decimal.
		header.TotalQuantity = totalQuantity

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