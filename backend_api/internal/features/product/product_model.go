// package product

// import (
// 	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/category"
// 	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
// )

// type Product struct {
// 	ID                 uint               `json:"id" gorm:"primaryKey"`
// 	Kode               string             `json:"kode"`
// 	Name               string             `json:"name"`
// 	Price              uint               `json:"price"`
// 	Stock              uint               `json:"stock"`
// 	IDKategori         *uint              `json:"id_kategori"`
// 	Kategori           *category.Category `json:"kategori" gorm:"foreignKey:IDKategori"`
// 	TanggalKadaluwarsa *customtype.Date   `json:"tanggal_kadaluwarsa"`
// }

package product

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/category"
)

type Product struct {
	ID         uint               `json:"id" gorm:"primaryKey"`
	Name       string             `json:"name" gorm:"type:varchar(100);not null"`
	Stock      uint               `json:"stock" gorm:"not null;default:0"`
	IDKategori *uint              `json:"id_kategori"`
	Kategori   *category.Category `json:"kategori" gorm:"foreignKey:IDKategori"`
}