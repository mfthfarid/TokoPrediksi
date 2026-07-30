package adjustment

import (
	"errors"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/purchase"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type Service struct {
	repo *Repository
}

func NewService() *Service {
	return &Service{repo: &Repository{}}
}

func (s *Service) GetExpiringBatches(search string) ([]ExpiringBatchGroup, error) {
	return s.repo.GetExpiringBatches(search)
}

func (s *Service) GetHistory(query HistoryQuery) ([]AdjustmentHistoryRow, error) {
	return s.repo.FindHistory(query)
}

func (s *Service) Create(input CreateAdjustmentInput, createdBy *uint) (*StockAdjustment, error) {
	if input.Quantity.LessThanOrEqual(decimal.Zero) {
		return nil, errors.New("quantity harus lebih besar dari 0")
	}

	var created StockAdjustment

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		cost, err := purchase.ConsumeStock(tx, input.ProductID, &input.TanggalKadaluwarsa, input.Quantity)
		if err != nil {
			return err
		}

		if err := tx.Model(&product.Product{}).
			Where("id = ?", input.ProductID).
			UpdateColumn("stock", gorm.Expr("stock - ?", input.Quantity)).Error; err != nil {
			return err
		}

		adj := &StockAdjustment{
			ProductID:          input.ProductID,
			TanggalKadaluwarsa: input.TanggalKadaluwarsa,
			QuantityAdjusted:   input.Quantity,
			AdjustmentType:     AdjustmentType(input.AdjustmentType),
			EstimatedLoss:      cost,
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