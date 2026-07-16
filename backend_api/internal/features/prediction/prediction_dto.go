package prediction

// Request dari React Native ke Go
type PredictRequestInput struct {
	Periods int `json:"periods" binding:"omitempty,gt=0"`
}

// Struct untuk komunikasi Go → Python (sesuai kontrak yang sudah divalidasi)
type pythonHistoryPoint struct {
	DS string  `json:"ds"`
	Y  float64 `json:"y"`
}

type pythonPredictRequest struct {
	ProductID uint                 `json:"product_id"`
	History   []pythonHistoryPoint `json:"history"`
	Periods   int                  `json:"periods"`
}

type pythonPredictionPoint struct {
	DS        string  `json:"ds"`
	Yhat      float64 `json:"yhat"`
	YhatLower float64 `json:"yhat_lower"`
	YhatUpper float64 `json:"yhat_upper"`
}

type pythonPredictResponse struct {
	ProductID   uint                     `json:"product_id"`
	Predictions []pythonPredictionPoint  `json:"predictions"`
}