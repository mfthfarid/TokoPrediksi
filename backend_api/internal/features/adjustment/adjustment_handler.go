package adjustment

import (
	"net/http"
	"strconv" // Tambahkan ini untuk parsing parameter URL

	"github.com/gin-gonic/gin"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/validator"
)

type Handler struct {
	service *Service
}

func NewHandler() *Handler {
	return &Handler{service: NewService()}
}

func (h *Handler) GetProductsSimple(c *gin.Context) {
	products, err := h.service.GetProductsSimple()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar produk"})
		return
	}
	c.JSON(http.StatusOK, products)
}

// POINT 2: Endpoint baru untuk mengambil batch terurut (Ide 2)
func (h *Handler) GetAvailableBatches(c *gin.Context) {
	productIDStr := c.Param("productId")
	productID, err := strconv.ParseUint(productIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}

	batches, err := h.service.GetAvailableBatches(uint(productID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar batch"})
		return
	}
	
	c.JSON(http.StatusOK, batches)
}

func (h *Handler) GetExpiringBatches(c *gin.Context) {
	search := c.Query("search")
	batches, err := h.service.GetExpiringBatches(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data barang kadaluwarsa"})
		return
	}
	c.JSON(http.StatusOK, batches)
}

func (h *Handler) GetHistory(c *gin.Context) {
	var query HistoryQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validator.FormatValidationError(err)})
		return
	}

	history, err := h.service.GetHistory(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil riwayat penyesuaian"})
		return
	}
	c.JSON(http.StatusOK, history)
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateAdjustmentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validator.FormatValidationError(err)})
		return
	}

	var createdBy *uint
	if val, exists := c.Get("user_id"); exists {
		if uid, ok := val.(uint); ok {
			createdBy = &uid
		}
	}

	adj, err := h.service.Create(input, createdBy)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, adj)
}