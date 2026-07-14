package product

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/unit"
	"github.com/shopspring/decimal"
)

type ProductUnit struct {
	ID               uint            `json:"id" gorm:"primaryKey"`
	ProductID        uint            `json:"product_id" gorm:"not null"`
	UnitID           uint            `json:"unit_id" gorm:"not null"`
	Unit             unit.Unit       `json:"unit" gorm:"foreignKey:UnitID"`
	Barcode          *string         `json:"barcode" gorm:"type:varchar(50);uniqueIndex"`
	ConversionToBase decimal.Decimal `json:"conversion_to_base" gorm:"type:decimal(10,2);not null"`
	SellPrice        *uint           `json:"sell_price"`
	IsBaseUnit       bool            `json:"is_base_unit" gorm:"default:false"`
}