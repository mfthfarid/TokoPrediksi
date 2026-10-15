package reorder

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler() *Handler {
	return &Handler{service: NewService()}
}

func (h *Handler) GetReorderInfo(c *gin.Context) {
	productID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}

	info, err := h.service.Calculate(uint(productID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, info)
}

func (h *Handler) GetAllReorderInfo(c *gin.Context) {
	items, err := h.service.CalculateAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung titik pemesanan ulang"})
		return
	}
	c.JSON(http.StatusOK, items)
}

// Recompute: pemicu manual (untuk uji/debug). Cron mingguan memanggil logika yang sama.
func (h *Handler) Recompute(c *gin.Context) {
	updated := h.service.RecomputeAllT()
	c.JSON(http.StatusOK, gin.H{"updated_products": updated})
}