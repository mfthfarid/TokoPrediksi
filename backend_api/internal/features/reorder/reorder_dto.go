package reorder

type ReorderInfo struct {
	ProductID    uint    `json:"product_id"`
	ProductName  string  `json:"product_name"`
	CurrentStock float64 `json:"current_stock"`

	LeadTimeDays   int     `json:"lead_time_days"`
	LeadTimeSource string  `json:"lead_time_source"` // "supplier" | "default"
	ServiceLevel   float64 `json:"service_level"`
	TSource        string  `json:"t_source"` // "computed" | "seed" | "seed_approx" | "none"

	HasPrediction   bool `json:"has_prediction"`
	PredictionStale bool `json:"prediction_stale"`

	DemandLeadTime      *float64 `json:"demand_lead_time"` // D_L
	SafetyStock         *float64 `json:"safety_stock"`     // = T yang dipakai (minimal 0)
	ReorderPoint        *float64 `json:"reorder_point"`
	Status              string   `json:"status"` // "safe" | "near" | "below_rop" | "unknown"
	RecommendedPurchase *float64 `json:"recommended_purchase_quantity"`

	RecommendationAvailable bool `json:"recommendation_available"`
	NeedsReorder            bool `json:"needs_reorder"`

	DisplayUnit                string `json:"display_unit"`
	CurrentStockDisplay        string `json:"current_stock_display"`
	DemandLeadTimeDisplay      string `json:"demand_lead_time_display"`
	SafetyStockDisplay         string `json:"safety_stock_display"`
	ReorderPointDisplay        string `json:"reorder_point_display"`
	RecommendedPurchaseDisplay string `json:"recommended_purchase_display"`
}