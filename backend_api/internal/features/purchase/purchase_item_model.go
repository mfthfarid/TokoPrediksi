package purchase

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/product"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
)

type PurchaseItem struct {
	ID                 uint                  `json:"id" gorm:"primaryKey"`
	PurchaseID         uint                  `json:"purchase_id" gorm:"not null"`
	ProductID          uint                  `json:"product_id" gorm:"not null"`
	Product            product.Product       `json:"product" gorm:"foreignKey:ProductID"`
	ProductUnitID      uint                  `json:"product_unit_id" gorm:"not null"`
	ProductUnit        product.ProductUnit   `json:"product_unit" gorm:"foreignKey:ProductUnitID"`
	Quantity           uint                  `json:"quantity" gorm:"not null"`
	QuantityBase       uint                  `json:"quantity_base" gorm:"not null"`
	QuantityRemaining  uint                  `json:"quantity_remaining" gorm:"not null"`
	PurchasePrice      uint                  `json:"purchase_price" gorm:"not null"`
	CostPerBase        uint                  `json:"cost_per_base" gorm:"not null"`
	TanggalKadaluwarsa *customtype.Date      `json:"tanggal_kadaluwarsa"`
	Subtotal           uint                  `json:"subtotal" gorm:"not null"`
}