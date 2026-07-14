package purchase

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/validator"
)

type PurchaseHandler struct {
	service *PurchaseService
}

func NewPurchaseHandler() *PurchaseHandler {
	return &PurchaseHandler{service: NewPurchaseService()}
}

func (h *PurchaseHandler) GetPurchases(c *gin.Context) {
	purchases, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pembelian"})
		return
	}
	c.JSON(http.StatusOK, purchases)
}

func (h *PurchaseHandler) GetPurchase(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}
	p, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PurchaseHandler) AddPurchase(c *gin.Context) {
	var input CreatePurchaseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validator.FormatValidationError(err)})
		return
	}

	p, err := h.service.Create(input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}