package report

type ProfitReportQuery struct {
	StartDate string `form:"start_date" binding:"required"`
	EndDate   string `form:"end_date" binding:"required"`
	ProductID *uint  `form:"product_id"`
}

type ProductProfitRow struct {
	ProductID    uint    `json:"product_id"`
	ProductName  string  `json:"product_name"`
	TotalQty     float64 `json:"total_qty_sold"`
	TotalRevenue int     `json:"total_revenue"`
	TotalCost    int     `json:"total_cost"`
	TotalProfit  int     `json:"total_profit"`
	ProfitMargin float64 `json:"profit_margin"`
}

type GrandTotal struct {
	TotalRevenue      int     `json:"total_revenue"`
	TotalCost         int     `json:"total_cost"`
	TotalProfit       int     `json:"total_profit"`
	ProfitMargin      float64 `json:"profit_margin"`
	TotalTransactions int     `json:"total_transactions"`
	TotalItemsSold    int     `json:"total_items_sold"`
}

type PeriodComparison struct {
	RevenueChangePercent *float64 `json:"revenue_change_percent"` // null kalau periode sebelumnya 0 (tidak bisa hitung %)
	ProfitChangePercent  *float64 `json:"profit_change_percent"`
}

type ProfitReportResponse struct {
	StartDate  string             `json:"start_date"`
	EndDate    string             `json:"end_date"`
	Products   []ProductProfitRow `json:"products"`
	GrandTotal GrandTotal         `json:"grand_total"`
	Comparison PeriodComparison   `json:"comparison"`
}