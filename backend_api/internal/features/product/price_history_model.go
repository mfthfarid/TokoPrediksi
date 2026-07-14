package product

import "time"

type PriceHistory struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	ProductUnitID uint      `json:"product_unit_id" gorm:"not null"`
	OldPrice      *uint     `json:"old_price"`
	NewPrice      uint      `json:"new_price" gorm:"not null"`
	ChangedBy     *uint     `json:"changed_by"`
	ChangedAt     time.Time `json:"changed_at"`
}