package adjustment

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
	"github.com/shopspring/decimal"
)

type CreateAdjustmentInput struct {
	ProductID          uint            `json:"product_id" binding:"required"`
	TanggalKadaluwarsa customtype.Date `json:"tanggal_kadaluwarsa"`
	Quantity           decimal.Decimal `json:"quantity"`
	AdjustmentType     string          `json:"adjustment_type" binding:"required,oneof=retur rugi"`
	Note               *string         `json:"note" binding:"omitempty,max=255"`
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