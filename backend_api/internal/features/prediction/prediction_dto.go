package prediction

type PredictRequestInput struct {
	Periods int `json:"periods" binding:"omitempty,gt=0"`
}

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
	ProductID    uint                    `json:"product_id"`
	ModelVersion string                  `json:"model_version"`
	Predictions  []pythonPredictionPoint `json:"predictions"`
}

type ChartPoint struct {
	Date     string  `json:"date"`
	Quantity float64 `json:"quantity"`
}

type ChartPredictedPoint struct {
	Date     string   `json:"date"`
	Quantity float64  `json:"quantity"`
	Lower    *float64 `json:"lower"`
	Upper    *float64 `json:"upper"`
}

type ChartData struct {
	Actual    []ChartPoint          `json:"actual"`
	Predicted []ChartPredictedPoint `json:"predicted"`
}

type PredictionSummaryResponse struct {
	ProductID         uint         `json:"product_id"`
	ProductName       string       `json:"product_name"`
	HasPrediction     bool         `json:"has_prediction"`
	RunID             string       `json:"run_id"`
	GeneratedAt       string       `json:"generated_at"`
	CurrentStock      float64      `json:"current_stock"`
	AverageDailySales float64      `json:"average_daily_sales"`
	DaysRemaining     *float64     `json:"days_remaining"`
	Urgency                    string       `json:"urgency"`
	RecommendedRestockQuantity int          `json:"recommended_restock_quantity"`
	ChartData                  ChartData    `json:"chart_data"`
	Predictions                []Prediction `json:"predictions"`

	DisplayUnit               string `json:"display_unit"`
	CurrentStockDisplay       string `json:"current_stock_display"`
	AverageDailySalesDisplay  string `json:"average_daily_sales_display"`
	RecommendedRestockDisplay string `json:"recommended_restock_display"`
}

type PredictionSummaryItem struct {
	ProductID         uint     `json:"product_id"`
	ProductName       string   `json:"product_name"`
	CurrentStock      float64  `json:"current_stock"`
	AverageDailySales float64  `json:"average_daily_sales"`
	DaysRemaining     *float64 `json:"days_remaining"`
	Urgency           string   `json:"urgency"`
	HasPrediction     bool     `json:"has_prediction"`

	DisplayUnit              string `json:"display_unit"`
	CurrentStockDisplay      string `json:"current_stock_display"`
	AverageDailySalesDisplay string `json:"average_daily_sales_display"`
}