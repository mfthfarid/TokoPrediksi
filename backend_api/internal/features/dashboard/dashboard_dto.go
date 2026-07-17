package dashboard

type LowStockProduct struct {
	ID    uint    `json:"id"`
	Name  string  `json:"name"`
	Stock float64 `json:"stock"`
}

type TopSellingProduct struct {
	ID        uint    `json:"id"`
	Name      string  `json:"name"`
	TotalSold float64 `json:"total_sold"`
}

type DashboardSummary struct {
	TotalSalesToday        uint                `json:"total_sales_today"`
	TotalTransactionsToday int                 `json:"total_transactions_today"`
	TotalProfitToday       int                 `json:"total_profit_today"`
	ProfitMarginToday      float64             `json:"profit_margin_today"`
	LowStockCount          int                 `json:"low_stock_count"`
	LowStockProducts       []LowStockProduct   `json:"low_stock_products"`
	TopSellingProducts     []TopSellingProduct `json:"top_selling_products"`
	PredictedStockoutCount int                 `json:"predicted_stockout_count"`
}