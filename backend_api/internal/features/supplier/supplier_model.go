package supplier

type Supplier struct {
	ID      uint    `json:"id" gorm:"primaryKey"`
	Name    string  `json:"name" gorm:"type:varchar(150);not null"`
	Phone   *string `json:"phone" gorm:"type:varchar(20)"`
	Address *string `json:"address" gorm:"type:varchar(255)"`
}