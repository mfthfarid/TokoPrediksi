package purchase

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
	"github.com/shopspring/decimal"
)

type CreatePurchaseItemInput struct {
	ProductID          uint             `json:"product_id" binding:"required"`
	ProductUnitID      uint             `json:"product_unit_id" binding:"required"`
	Quantity           decimal.Decimal  `json:"quantity"` // divalidasi manual di service (decimal tidak reliable dgn tag required)
	PurchasePrice      uint             `json:"purchase_price" binding:"required,gt=0"`
	TanggalKadaluwarsa *customtype.Date `json:"tanggal_kadaluwarsa"`
}

type CreatePurchaseInput struct {
	SupplierID   *uint                     `json:"supplier_id" binding:"omitempty"`
	PurchaseDate customtype.Date           `json:"purchase_date"`
	Items        []CreatePurchaseItemInput `json:"items" binding:"required,min=1,dive"`
}