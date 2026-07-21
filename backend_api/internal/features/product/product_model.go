package product

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/category"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/cloudinary"
	"github.com/shopspring/decimal"
)

type Product struct {
	ID                uint               `json:"id" gorm:"primaryKey"`
	Name              string             `json:"name" gorm:"type:varchar(100);not null"`
	PhotoURL          *string            `json:"photo_url" gorm:"type:varchar(255)"`
	PhotoThumbnailURL *string            `json:"photo_thumbnail_url" gorm:"-"` // "-" artinya tidak disimpan di DB, cuma dihitung saat response
	PhotoDetailURL    *string            `json:"photo_detail_url" gorm:"-"`
	Stock             decimal.Decimal    `json:"stock" gorm:"type:decimal(10,2);not null;default:0"`
	IDKategori        *uint              `json:"id_kategori"`
	Kategori          *category.Category `json:"kategori" gorm:"foreignKey:IDKategori"`
	Units             []ProductUnit      `json:"units,omitempty" gorm:"foreignKey:ProductID"`
}

// PopulatePhotoURLs mengisi PhotoThumbnailURL & PhotoDetailURL dari PhotoURL asli.
// Dipanggil manual setelah data diambil dari database (karena field ini bukan kolom asli).
func (p *Product) PopulatePhotoURLs() {
	if p.PhotoURL == nil {
		return
	}
	thumb := cloudinary.ThumbnailURL(*p.PhotoURL)
	detail := cloudinary.DetailURL(*p.PhotoURL)
	p.PhotoThumbnailURL = &thumb
	p.PhotoDetailURL = &detail
}