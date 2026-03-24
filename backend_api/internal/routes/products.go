// backend/routes/products.go
package routes

import (
	// "backend/config"
	// "backend/models"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/models"

	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetProducts mengembalikan semua produk
func GetProducts(c *gin.Context) {
	var products []models.Product
	config.DB.Find(&products)
	c.JSON(http.StatusOK, products)
}

// GetProduct mengembalikan satu produk berdasarkan ID
func GetProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var product models.Product
	config.DB.First(&product, id)

	if product.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// AddProduct menambahkan produk baru
func AddProduct(c *gin.Context) {
	var input struct {
		Name  string `json:"name"`
		Price uint   `json:"price"`
		Stock uint   `json:"stock"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product := models.Product{
		Name:  input.Name,
		Price: input.Price,
		Stock: input.Stock,
	}

	config.DB.Create(&product)
	c.JSON(http.StatusOK, product)
}