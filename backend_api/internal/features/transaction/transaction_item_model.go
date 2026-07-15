package transaction

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/shopspring/decimal"
)

type TransactionItem struct {
	ID            uint                `json:"id" gorm:"primaryKey"`
	TransactionID uint                `json:"transaction_id" gorm:"not null"`
	ProductID     uint                `json:"product_id" gorm:"not null"`
	Product       product.Product     `json:"product" gorm:"foreignKey:ProductID"`
	ProductUnitID uint                `json:"product_unit_id" gorm:"not null"`
	ProductUnit   product.ProductUnit `json:"product_unit" gorm:"foreignKey:ProductUnitID"`
	Quantity      decimal.Decimal     `json:"quantity" gorm:"type:decimal(10,2);not null"`
	QuantityBase  decimal.Decimal     `json:"quantity_base" gorm:"type:decimal(10,2);not null"`
	PriceAtSale   uint                `json:"price_at_sale" gorm:"not null"`
	CostPrice     uint                `json:"cost_price" gorm:"not null"`
	Subtotal      uint                `json:"subtotal" gorm:"not null"`
}