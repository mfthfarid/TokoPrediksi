package product

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/validator"
)

type ProductUnitHandler struct {
	service *ProductUnitService
}

func NewProductUnitHandler() *ProductUnitHandler {
	return &ProductUnitHandler{service: NewProductUnitService()}
}

// Get
func (h *ProductUnitHandler) GetUnitsByProduct(c *gin.Context) {
	productID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}
	units, err := h.service.GetByProductID(uint(productID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data satuan"})
		return
	}
	c.JSON(http.StatusOK, units)
}

// Add
func (h *ProductUnitHandler) AddUnit(c *gin.Context) {
	productID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}

	var input AddProductUnitInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validator.FormatValidationError(err)})
		return
	}

	pu, err := h.service.AddUnit(uint(productID), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, pu)
}

// Update Unit
func (h *ProductUnitHandler) UpdateUnit(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("unitId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var input UpdateProductUnitInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validator.FormatValidationError(err)})
		return
	}

	pu, err := h.service.UpdateUnit(uint(id), input)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pu)
}

// Update Price
func (h *ProductUnitHandler) UpdatePrice(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("unitId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var input UpdatePriceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validator.FormatValidationError(err)})
		return
	}

	var changedBy *uint
	if val, exists := c.Get("user_id"); exists {
		if uid, ok := val.(uint); ok {
			changedBy = &uid
		}
	}

	pu, err := h.service.UpdatePrice(uint(id), input, changedBy)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pu)
}

// Get Price History
func (h *ProductUnitHandler) GetPriceHistory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("unitId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	history, err := h.service.GetPriceHistory(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil riwayat harga"})
		return
	}
	c.JSON(http.StatusOK, history)
}

// Delete
func (h *ProductUnitHandler) DeleteUnit(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("unitId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	if err := h.service.DeleteUnit(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Satuan berhasil dihapus"})
}