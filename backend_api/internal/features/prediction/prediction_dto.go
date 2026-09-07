package prediction

// Request dari React Native ke Go
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
	HasPrediction              bool       `json:"has_prediction"`
	CurrentStock               float64    `json:"current_stock"`
	AverageDailySales          float64    `json:"average_daily_sales"`
	DaysRemaining              *float64   `json:"days_remaining"`
	Urgency                    string     `json:"urgency"`
	RecommendedRestockQuantity int        `json:"recommended_restock_quantity"`
	ChartData                  ChartData  `json:"chart_data"`
	Predictions                []Prediction `json:"predictions"`

	// konversi sesuai satuan dasar produk
	DisplayUnit                string `json:"display_unit"`                // "Kg", "Pcs", "Liter", dst
	CurrentStockDisplay        string `json:"current_stock_display"`       // "2.5"
	AverageDailySalesDisplay   string `json:"average_daily_sales_display"` // "0.8"
	RecommendedRestockDisplay  string `json:"recommended_restock_display"` // "15"
}

type PredictionSummaryItem struct {
	ProductID         uint     `json:"product_id"`
	ProductName       string   `json:"product_name"`
	CurrentStock      float64  `json:"current_stock"`
	AverageDailySales float64  `json:"average_daily_sales"`
	DaysRemaining     *float64 `json:"days_remaining"`
	Urgency           string   `json:"urgency"` // "tinggi" | "sedang" | "rendah"
	HasPrediction     bool     `json:"has_prediction"`

	DisplayUnit            	 string `json:"display_unit"`
	CurrentStockDisplay      string `json:"current_stock_display"`
	AverageDailySalesDisplay string `json:"average_daily_sales_display"`
}