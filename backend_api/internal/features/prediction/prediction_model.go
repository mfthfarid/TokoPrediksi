package prediction

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"

type Prediction struct {
	ID                 uint             `json:"id" gorm:"primaryKey"`
	ProductID          uint             `json:"product_id" gorm:"not null"`
	PredictionDate     customtype.Date  `json:"prediction_date" gorm:"type:date;not null"`
	PredictedQuantity  int              `json:"predicted_quantity" gorm:"not null"`
	YhatLower          *int             `json:"yhat_lower"`
	YhatUpper          *int             `json:"yhat_upper"`
	ModelVersion       *string          `json:"model_version" gorm:"type:varchar(50)"`
}