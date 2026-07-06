package product

import (
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/category"
)

type Product struct {
	ID                 uint               `json:"id" gorm:"primaryKey"`
	Kode               string             `json:"kode"`
	Name               string             `json:"name"`
	Price              uint               `json:"price"`
	Stock              uint               `json:"stock"`
	IDKategori         *uint              `json:"id_kategori"`
	Kategori           *category.Category `json:"kategori" gorm:"foreignKey:IDKategori"`
	TanggalKadaluwarsa *time.Time         `json:"tanggal_kadaluwarsa"`
}