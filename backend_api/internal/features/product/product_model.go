package product

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/category"
	"github.com/shopspring/decimal"
)

type Product struct {
	ID         uint               `json:"id" gorm:"primaryKey"`
	Name       string             `json:"name" gorm:"type:varchar(100);not null"`
	Stock      decimal.Decimal    `json:"stock" gorm:"type:decimal(10,2);not null;default:0"`
	IDKategori *uint              `json:"id_kategori"`
	Kategori   *category.Category `json:"kategori" gorm:"foreignKey:IDKategori"`
	Units      []ProductUnit      `json:"units,omitempty" gorm:"foreignKey:ProductID"`
}