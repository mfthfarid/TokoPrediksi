package prediction

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PredictionHandler struct {
	service *PredictionService
}

func NewPredictionHandler() *PredictionHandler {
	return &PredictionHandler{service: NewPredictionService()}
}

func (h *PredictionHandler) Predict(c *gin.Context) {
	productID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}

	var input PredictRequestInput
	_ = c.ShouldBindJSON(&input) // body boleh kosong, pakai default periods=7

	predictions, err := h.service.Predict(uint(productID), input.Periods)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, predictions)
}

func (h *PredictionHandler) GetPredictions(c *gin.Context) {
	productID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}

	predictions, err := h.service.GetByProductID(uint(productID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data prediksi"})
		return
	}
	c.JSON(http.StatusOK, predictions)
}