package product

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/cloudinary"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/validator"
)

type ProductHandler struct {
	service *ProductService
}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{service: NewProductService()}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	products, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data produk"})
		return
	}
	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
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

func (h *ProductHandler) AddProduct(c *gin.Context) {
	var input CreateProductInput
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

// Upload Foto
func (h *ProductHandler) UploadPhoto(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	fileHeader, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File foto tidak ditemukan"})
		return
	}

	if err := validator.ValidateImageFile(fileHeader); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuka file"})
		return
	}
	defer file.Close()

	photoURL, err := cloudinary.UploadImage(file, "tokoprediksi/products")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupload foto ke cloud"})
		return
	}

	p, err := h.service.UpdatePhoto(uint(id), photoURL)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var input UpdateProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validator.FormatValidationError(err)})
		return
	}

	p, err := h.service.Update(uint(id), input)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *ProductHandler) ScanBarcode(c *gin.Context) {
	barcode := c.Param("barcode")
	pu, err := h.service.FindByBarcode(barcode)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pu)
}