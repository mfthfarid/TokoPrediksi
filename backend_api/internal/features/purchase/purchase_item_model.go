package purchase

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
	"github.com/shopspring/decimal"
)

type PurchaseItem struct {
	ID                 uint                  `json:"id" gorm:"primaryKey"`
	PurchaseID         uint                  `json:"purchase_id" gorm:"not null"`
	ProductID          uint                  `json:"product_id" gorm:"not null"`
	Product            product.Product       `json:"product" gorm:"foreignKey:ProductID"`
	ProductUnitID      uint                  `json:"product_unit_id" gorm:"not null"`
	ProductUnit        product.ProductUnit   `json:"product_unit" gorm:"foreignKey:ProductUnitID"`
	Quantity           decimal.Decimal       `json:"quantity" gorm:"type:decimal(10,2);not null"`
	QuantityBase       decimal.Decimal       `json:"quantity_base" gorm:"type:decimal(10,2);not null"`
	QuantityRemaining  decimal.Decimal       `json:"quantity_remaining" gorm:"type:decimal(10,2);not null"`
	PurchasePrice      uint                  `json:"purchase_price" gorm:"not null"`
	CostPerBase        uint                  `json:"cost_per_base" gorm:"not null"`
	TanggalKadaluwarsa *customtype.Date      `json:"tanggal_kadaluwarsa"`
	Subtotal           uint                  `json:"subtotal" gorm:"not null"`
}