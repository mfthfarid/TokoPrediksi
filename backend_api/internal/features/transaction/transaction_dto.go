package transaction

import "github.com/shopspring/decimal"

type CreateTransactionItemInput struct {
	ProductID     uint            `json:"product_id" binding:"required"`
	ProductUnitID uint            `json:"product_unit_id" binding:"required"`
	Quantity      decimal.Decimal `json:"quantity"` // divalidasi manual di service
}

type CreateTransactionInput struct {
	DiscountType  *DiscountType                 `json:"discount_type" binding:"omitempty,oneof=nominal percentage"`
	DiscountValue *uint                         `json:"discount_value" binding:"omitempty"`
	Items         []CreateTransactionItemInput  `json:"items" binding:"required,min=1,dive"`
}