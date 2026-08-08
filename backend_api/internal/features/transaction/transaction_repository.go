package transaction

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
	"gorm.io/gorm"
)

type TransactionRepository struct{}

func (r *TransactionRepository) FindAll(startDate, endDate string) ([]Transaction, error) {
	var transactions []Transaction

	query := config.DB.
		Preload("Items").
		Preload("Items.Product", func(db *gorm.DB) *gorm.DB {
			return db.Unscoped()
		}).
		Preload("Items.ProductUnit").
		Preload("Items.ProductUnit.Unit").
		Order("transaction_date DESC")

	if startDate != "" {
		query = query.Where("transaction_date >= ?", startDate)
	}

	if endDate != "" {
		query = query.Where("transaction_date < ?", endDate)
	}

	err := query.Find(&transactions).Error
	if err != nil {
		return nil, err
	}

	return transactions, nil
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