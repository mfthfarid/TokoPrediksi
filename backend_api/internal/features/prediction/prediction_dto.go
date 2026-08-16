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

type ChartPoint struct {
	Date     string  `json:"date"`
	Quantity float64 `json:"quantity"`
}

type ChartPredictedPoint struct {
	Date     string `json:"date"`
	Quantity int    `json:"quantity"`
	Lower    *int   `json:"lower"`
	Upper    *int   `json:"upper"`
}

type ChartData struct {
	Actual    []ChartPoint          `json:"actual"`
	Predicted []ChartPredictedPoint `json:"predicted"`
}

type PredictionSummaryResponse struct {
	ProductID                  uint       `json:"product_id"`
	ProductName                string     `json:"product_name"`
	HasPrediction               bool       `json:"has_prediction"`
	CurrentStock                float64    `json:"current_stock"`
	AverageDailySales            float64    `json:"average_daily_sales"`
	DaysRemaining                 *float64   `json:"days_remaining"` // null kalau rata-rata penjualan 0 (gak bisa dihitung)
	Urgency                       string     `json:"urgency"`         // "tinggi" | "sedang" | "rendah"
	RecommendedRestockQuantity    int        `json:"recommended_restock_quantity"`
	ChartData                     ChartData  `json:"chart_data"`
	Predictions                   []Prediction `json:"predictions"`
}

type PredictionSummaryItem struct {
	ProductID         uint     `json:"product_id"`
	ProductName       string   `json:"product_name"`
	CurrentStock      float64  `json:"current_stock"`
	AverageDailySales float64  `json:"average_daily_sales"`
	DaysRemaining     *float64 `json:"days_remaining"`
	Urgency           string   `json:"urgency"` // "tinggi" | "sedang" | "rendah"
	HasPrediction     bool     `json:"has_prediction"`
}