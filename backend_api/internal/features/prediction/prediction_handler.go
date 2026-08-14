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

// PredictAll menjalankan algoritma prediksi untuk SELURUH produk yang ada
func (h *PredictionHandler) PredictAll(c *gin.Context) {
	var input PredictRequestInput
	_ = c.ShouldBindJSON(&input) // Boleh kosong, body tidak wajib. Jika kosong nanti di service di-set default periods=7

	// Memanggil fungsi PredictAll di Service (seperti yang kita bahas sebelumnya)
	err := h.service.PredictAll(input.Periods) 
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal menjalankan prediksi massal",
			"detail": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil! Prediksi untuk semua produk telah diperbarui.",
	})
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