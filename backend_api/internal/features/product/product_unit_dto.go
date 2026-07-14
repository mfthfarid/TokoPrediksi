package product

import "github.com/shopspring/decimal"

type AddProductUnitInput struct {
	UnitID           uint            `json:"unit_id" binding:"required"`
	Barcode          *string         `json:"barcode" binding:"omitempty"`
	ConversionToBase decimal.Decimal `json:"conversion_to_base"`
	SellPrice        *uint           `json:"sell_price" binding:"omitempty"`
	IsBaseUnit       bool            `json:"is_base_unit"`
}

type UpdateProductUnitInput struct {
	Barcode          *string          `json:"barcode" binding:"omitempty"`
	ConversionToBase *decimal.Decimal `json:"conversion_to_base" binding:"omitempty"`
}

type UpdatePriceInput struct {
	NewPrice uint `json:"new_price" binding:"required,gt=0"`
}