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

type PriceInfoResponse struct {
	UnitName        string  `json:"unit_name"`
	CostPerBase     *uint   `json:"cost_per_base"`      // modal per satuan dasar (pcs), dari restok terakhir
	CostPerUnit     *uint   `json:"cost_per_unit"`       // modal dikonversi ke satuan ini (misal per renteng)
	CurrentSellPrice *uint  `json:"current_sell_price"`
}