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

type ProfitReportResponse struct {
	StartDate  string             `json:"start_date"`
	EndDate    string             `json:"end_date"`
	Products   []ProductProfitRow `json:"products"`
	GrandTotal ProductProfitRow   `json:"grand_total"`
}