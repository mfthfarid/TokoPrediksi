package unit

type Unit struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"type:varchar(20);uniqueIndex;not null"`
}