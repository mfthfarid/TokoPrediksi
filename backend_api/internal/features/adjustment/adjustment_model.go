package adjustment

import (
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
	"github.com/shopspring/decimal"
)

type AdjustmentType string

const (
	AdjustmentRetur    AdjustmentType = "retur"
	AdjustmentKerugian AdjustmentType = "rugi"
)

type ProductSimple struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type StockAdjustment struct {
	ID                 uint            `json:"id" gorm:"primaryKey"`
	ProductID          uint            `json:"product_id" gorm:"not null"`
	PurchaseItemID     uint            `json:"purchase_item_id" gorm:"not null"`
	TanggalKadaluwarsa customtype.Date `json:"tanggal_kadaluwarsa" gorm:"type:date"`
	QuantityAdjusted   decimal.Decimal `json:"quantity_adjusted" gorm:"type:decimal(10,2);not null"`
	AdjustmentType     AdjustmentType  `json:"adjustment_type" gorm:"type:enum('retur','rugi');not null"`
	EstimatedLoss      uint            `json:"estimated_loss" gorm:"not null;default:0"`
	Note               *string         `json:"note" gorm:"type:varchar(255)"`
	CreatedBy          *uint           `json:"created_by"`
	CreatedAt          time.Time       `json:"created_at"`
}