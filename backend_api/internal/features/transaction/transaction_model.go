package transaction

type DiscountType string

const (
	DiscountNominal    DiscountType = "nominal"
	DiscountPercentage DiscountType = "percentage"
)

type Transaction struct {
	ID              uint              `json:"id" gorm:"primaryKey"`
	TransactionDate string            `json:"transaction_date" gorm:"type:date;not null"`
	TotalAmount     uint              `json:"total_amount" gorm:"not null;default:0"`
	DiscountType    *DiscountType     `json:"discount_type" gorm:"type:enum('nominal','percentage')"`
	DiscountValue   *uint             `json:"discount_value" gorm:"default:0"`
	FinalAmount     uint              `json:"final_amount" gorm:"not null;default:0"`
	Items           []TransactionItem `json:"items,omitempty" gorm:"foreignKey:TransactionID"`
}