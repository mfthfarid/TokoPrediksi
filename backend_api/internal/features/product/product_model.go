package product

type Product struct {
	ID    uint   `json:"id" gorm:"primaryKey"`
	Name  string `json:"name"`
	Price uint   `json:"price"`
	Stock uint   `json:"stock"`
}