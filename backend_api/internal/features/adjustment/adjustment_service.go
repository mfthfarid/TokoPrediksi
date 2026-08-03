package adjustment

import (
	"errors"
	"fmt"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Service struct {
	repo *Repository
}

func NewService() *Service {
	return &Service{repo: &Repository{}}
}

func (s *Service) GetProductsSimple() ([]ProductSimple, error) {
	return s.repo.GetProductsSimple()
}

func (s *Service) GetExpiringBatches(search string) ([]ExpiringBatchGroup, error) {
	return s.repo.GetExpiringBatches(search)
}

func (s *Service) GetHistory(query HistoryQuery) ([]AdjustmentHistoryRow, error) {
	return s.repo.FindHistory(query)
}

// POINT 2: Ambil Daftar Batch Terurut (Ide 2)
func (s *Service) GetAvailableBatches(productID uint) ([]BatchOptionDTO, error) {
	if productID == 0 {
		return nil, errors.New("product_id tidak valid")
	}
	return s.repo.GetAvailableBatches(productID)
}

// POINT 3: Simpan Barang Rusak berdasar PurchaseItemID
func (s *Service) Create(input CreateAdjustmentInput, createdBy *uint) (*StockAdjustment, error) {
	if input.Quantity.LessThanOrEqual(decimal.Zero) {
		return nil, errors.New("quantity harus lebih besar dari 0")
	}
	if input.PurchaseItemID == 0 {
		return nil, errors.New("batch barang (purchase_item_id) harus dipilih")
	}

	var created StockAdjustment

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Ambil & Kunci baris purchase_items yang dipilih
		type PurchaseItemSimple struct {
			ID                uint            `gorm:"primaryKey"`
			ProductID         uint            `gorm:"product_id"`
			QuantityRemaining decimal.Decimal `gorm:"quantity_remaining"`
			CostPerBase       int             `gorm:"cost_per_base"`
		}

		var pItem PurchaseItemSimple
		if err := tx.Table("purchase_items").
			Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND product_id = ?", input.PurchaseItemID, input.ProductID).
			First(&pItem).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("batch stok tidak ditemukan atau tidak sesuai dengan produk")
			}
			return err
		}

		// 2. Validasi sisa stok pada batch tersebut
		if pItem.QuantityRemaining.LessThan(input.Quantity) {
			return fmt.Errorf("stok sisa pada batch ini (%s) kurang dari jumlah yang diinput (%s)",
				pItem.QuantityRemaining.String(), input.Quantity.String())
		}

		// 3. Potong quantity_remaining di purchase_items
		if err := tx.Table("purchase_items").
			Where("id = ?", input.PurchaseItemID).
			UpdateColumn("quantity_remaining", gorm.Expr("quantity_remaining - ?", input.Quantity)).Error; err != nil {
			return err
		}

		// 4. Potong total stock di tabel products
		if err := tx.Model(&product.Product{}).
			Where("id = ?", input.ProductID).
			UpdateColumn("stock", gorm.Expr("stock - ?", input.Quantity)).Error; err != nil {
			return err
		}

		// 5. Hitung estimasi kerugian (CostPerBase * Quantity)
		costDecimal := decimal.NewFromInt(int64(pItem.CostPerBase))
		estimatedLoss := uint(input.Quantity.Mul(costDecimal).IntPart())

		// 6. Simpan transaksi ke tabel stock_adjustments
		adj := &StockAdjustment{
			ProductID:          input.ProductID,
			PurchaseItemID:     input.PurchaseItemID, // <-- Ditambahkan di sini
			TanggalKadaluwarsa: input.TanggalKadaluwarsa,
			QuantityAdjusted:   input.Quantity,
			AdjustmentType:     AdjustmentType(input.AdjustmentType),
			EstimatedLoss:      estimatedLoss,
			Note:               input.Note,
			CreatedBy:          createdBy,
		}
		if err := tx.Create(adj).Error; err != nil {
			return err
		}

		created = *adj
		return nil
	})

	if err != nil {
		return nil, err
	}
	return &created, nil
}