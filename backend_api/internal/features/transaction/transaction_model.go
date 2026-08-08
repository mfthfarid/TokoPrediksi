package transaction

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
	"github.com/shopspring/decimal"
)

type DiscountType string

const (
	DiscountNominal    DiscountType = "nominal"
	DiscountPercentage DiscountType = "percentage"
)

type Transaction struct {
	ID              uint                 `json:"id" gorm:"primaryKey"`
	TransactionCode string               `json:"transaction_code" gorm:"type:varchar(50);not null;uniqueIndex"`
	TransactionDate customtype.DateTime  `json:"transaction_date" gorm:"type:datetime;not null"`
	TotalQuantity   decimal.Decimal      `json:"total_quantity" gorm:"type:decimal(10,2);not null;default:0"`
	TotalAmount     uint                 `json:"total_amount" gorm:"column:total_amount;not null;default:0"`
	DiscountType    *DiscountType        `json:"discount_type" gorm:"type:enum('nominal','percentage')"`
	DiscountValue   *uint                `json:"discount_value" gorm:"column:discount_value;default:0"`
	FinalAmount     uint                 `json:"final_amount" gorm:"column:final_amount;not null;default:0"`
	Items           []TransactionItem    `json:"items,omitempty" gorm:"foreignKey:TransactionID"`
}