package report

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/validator"
)

type ReportHandler struct {
	service *ReportService
}

func NewReportHandler() *ReportHandler {
	return &ReportHandler{service: NewReportService()}
}

func (h *ReportHandler) GetProfitReport(c *gin.Context) {
	var query ProfitReportQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validator.FormatValidationError(err)})
		return
	}

	report, err := h.service.GetProfitReport(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil laporan laba"})
		return
	}
	c.JSON(http.StatusOK, report)
}