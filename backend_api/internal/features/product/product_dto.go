package product

import "github.com/shopspring/decimal"

type CreateProductUnitInput struct {
	UnitID           uint            `json:"unit_id" binding:"required"`
	Barcode          *string         `json:"barcode" binding:"omitempty"`
	ConversionToBase decimal.Decimal `json:"conversion_to_base"`
	SellPrice        *uint           `json:"sell_price" binding:"omitempty"`
	IsBaseUnit       bool            `json:"is_base_unit"`
}

type CreateProductInput struct {
	Name       string                   `json:"name" binding:"required,min=3,max=100"`
	IDKategori *uint                    `json:"id_kategori" binding:"omitempty"`
	Units      []CreateProductUnitInput `json:"units" binding:"required,min=1,dive"`
}

type UpdateProductInput struct {
	Name       *string `json:"name" binding:"omitempty,min=3,max=100"`
	IDKategori *uint   `json:"id_kategori" binding:"omitempty"`
}