package adjustment

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
	"github.com/shopspring/decimal"
)

// DTO untuk opsi Dropdown Batch di Frontend
type BatchOptionDTO struct {
	PurchaseItemID     uint            `json:"purchase_item_id"`
	TanggalKadaluwarsa string          `json:"tanggal_kadaluwarsa"`
	QuantityRemaining  decimal.Decimal `json:"quantity_remaining"`
	CostPerBase        int             `json:"cost_per_base"`
}

type CreateAdjustmentInput struct {
	ProductID      uint            `json:"product_id" binding:"required"`
	PurchaseItemID uint            `json:"purchase_item_id" binding:"required"`
	TanggalKadaluwarsa customtype.Date `json:"tanggal_kadaluwarsa"`
	Quantity       decimal.Decimal `json:"quantity" binding:"required"`
	AdjustmentType string          `json:"adjustment_type" binding:"required,oneof=retur rugi"`
	Note           *string         `json:"note" binding:"omitempty,max=255"`
}

type ExpiringBatchGroup struct {
	ProductID          uint    `json:"product_id"`
	ProductName        string  `json:"product_name"`
	TanggalKadaluwarsa string  `json:"tanggal_kadaluwarsa"`
	TotalRemaining     float64 `json:"total_remaining"`
}

type AdjustmentHistoryRow struct {
	ID                 uint    `json:"id"`
	ProductID          uint    `json:"product_id"`
	ProductName        string  `json:"product_name"`
	TanggalKadaluwarsa string  `json:"tanggal_kadaluwarsa"`
	QuantityAdjusted   float64 `json:"quantity_adjusted"`
	AdjustmentType     string  `json:"adjustment_type"`
	EstimatedLoss      int     `json:"estimated_loss"`
	Note               *string `json:"note"`
	CreatedAt          string  `json:"created_at"`
}

type HistoryQuery struct {
	ProductID      *uint   `form:"product_id"`
	AdjustmentType *string `form:"adjustment_type"`
	StartDate      *string `form:"start_date"`
	EndDate        *string `form:"end_date"`
}