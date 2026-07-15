package transaction

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type TransactionRepository struct{}

func (r *TransactionRepository) FindAll() ([]Transaction, error) {
	var transactions []Transaction
	err := config.DB.
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.ProductUnit").
		Preload("Items.ProductUnit.Unit").
		Order("transaction_date DESC").
		Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

func (r *TransactionRepository) FindByID(id uint) (*Transaction, error) {
	var t Transaction
	err := config.DB.
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.ProductUnit").
		Preload("Items.ProductUnit.Unit").
		First(&t, id).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}