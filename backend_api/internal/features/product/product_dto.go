package product

import "time"

type CreateProductInput struct {
	Kode               string     `json:"kode" binding:"required"`
	Name               string     `json:"name" binding:"required,min=3,max=100"`
	Price              uint       `json:"price" binding:"required,gt=0"`
	Stock              uint       `json:"stock" binding:"gte=0"`
	IDKategori         *uint      `json:"id_kategori" binding:"omitempty"`
	TanggalKadaluwarsa *time.Time `json:"tanggal_kadaluwarsa"`
}

type UpdateProductInput struct {
	Kode               *string    `json:"kode" binding:"omitempty"`
	Name               *string    `json:"name" binding:"omitempty,min=3,max=100"`
	Price              *uint      `json:"price" binding:"omitempty,gt=0"`
	Stock              *uint      `json:"stock" binding:"omitempty,gte=0"`
	IDKategori         *uint      `json:"id_kategori" binding:"omitempty"`
	TanggalKadaluwarsa *time.Time `json:"tanggal_kadaluwarsa"`
}