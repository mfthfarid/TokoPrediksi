package prediction

import (
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
)

type Prediction struct {
	ID                uint            `json:"id" gorm:"primaryKey"`
	RunID             string          `json:"run_id" gorm:"type:varchar(36);not null;index"`
	ProductID         uint            `json:"product_id" gorm:"not null"`
	PredictionDate    customtype.Date `json:"prediction_date" gorm:"type:date;not null"`
	PredictedQuantity float64         `json:"predicted_quantity" gorm:"type:decimal(14,2);not null"`
	YhatLower         *float64        `json:"yhat_lower" gorm:"type:decimal(14,2)"`
	YhatUpper         *float64        `json:"yhat_upper" gorm:"type:decimal(14,2)"`
	ModelVersion      *string         `json:"model_version" gorm:"type:varchar(64)"`
	CreatedAt         time.Time       `json:"created_at"`
}