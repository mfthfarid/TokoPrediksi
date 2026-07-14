package purchase

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/supplier"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
)

type Purchase struct {
	ID           uint               `json:"id" gorm:"primaryKey"`
	SupplierID   *uint              `json:"supplier_id"`
	Supplier     *supplier.Supplier `json:"supplier" gorm:"foreignKey:SupplierID"`
	PurchaseDate customtype.Date    `json:"purchase_date" gorm:"type:date;not null"`
	TotalAmount  uint               `json:"total_amount" gorm:"not null;default:0"`
	Items        []PurchaseItem     `json:"items,omitempty" gorm:"foreignKey:PurchaseID"`
}