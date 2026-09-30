package reorder

type ReorderInfo struct {
	ProductID      uint    `json:"product_id"`
	LeadTimeDays   int     `json:"lead_time_days"`
	LeadTimeSource string  `json:"lead_time_source"` // "supplier" atau "default"
	SafetyStock    float64 `json:"safety_stock"`
	ReorderPoint   float64 `json:"reorder_point"`
	CurrentStock   float64 `json:"current_stock"`
	NeedsReorder   bool    `json:"needs_reorder"`
}

type ReorderAlert struct {
	ProductID    uint    `json:"product_id"`
	ProductName  string  `json:"product_name"`
	CurrentStock float64 `json:"current_stock"`
	SafetyStock  float64 `json:"safety_stock"`
	ReorderPoint float64 `json:"reorder_point"`
}