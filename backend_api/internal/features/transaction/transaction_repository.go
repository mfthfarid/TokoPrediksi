package transaction

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"gorm.io/gorm"
)

type TransactionRepository struct{}

func (r *TransactionRepository) FindAll(startDate, endDate *string) ([]Transaction, error) {
	query := config.DB.
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.ProductUnit").
		Preload("Items.ProductUnit.Unit").
		Order("transaction_date DESC")

	if startDate != nil && endDate != nil {
		query = query.Where("transaction_date BETWEEN ? AND ?", *startDate, *endDate)
	}

	var transactions []Transaction
	err := query.Find(&transactions).Error
	return transactions, err
}

func (r *TransactionRepository) FindByID(id uint) (*Transaction, error) {
	var t Transaction
	err := config.DB.
		Preload("Items").
		Preload("Items.Product", func(db *gorm.DB) *gorm.DB { return db.Unscoped() }).
		Preload("Items.ProductUnit").
		Preload("Items.ProductUnit.Unit").
		First(&t, id).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}