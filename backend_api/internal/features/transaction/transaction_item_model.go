package transaction

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"

type TransactionItem struct {
	ID            uint                `json:"id" gorm:"primaryKey"`
	TransactionID uint                `json:"transaction_id" gorm:"not null"`
	ProductID     uint                `json:"product_id" gorm:"not null"`
	Product       product.Product     `json:"product" gorm:"foreignKey:ProductID"`
	ProductUnitID uint                `json:"product_unit_id" gorm:"not null"`
	ProductUnit   product.ProductUnit `json:"product_unit" gorm:"foreignKey:ProductUnitID"`
	Quantity      uint                `json:"quantity" gorm:"not null"`
	QuantityBase  uint                `json:"quantity_base" gorm:"not null"`
	PriceAtSale   uint                `json:"price_at_sale" gorm:"not null"`
	CostPrice     uint                `json:"cost_price" gorm:"not null"`
	Subtotal      uint                `json:"subtotal" gorm:"not null"`
}