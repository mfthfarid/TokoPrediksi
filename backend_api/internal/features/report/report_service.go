package report

type ReportService struct {
	repo *ReportRepository
}

func NewReportService() *ReportService {
	return &ReportService{repo: &ReportRepository{}}
}

func (s *ReportService) GetProfitReport(query ProfitReportQuery) (*ProfitReportResponse, error) {
	rows, err := s.repo.GetProfitByProduct(query.StartDate, query.EndDate, query.ProductID)
	if err != nil {
		return nil, err
	}

	grandTotal := ProductProfitRow{ProductName: "TOTAL"}
	for _, row := range rows {
		grandTotal.TotalQty += row.TotalQty
		grandTotal.TotalRevenue += row.TotalRevenue
		grandTotal.TotalCost += row.TotalCost
		grandTotal.TotalProfit += row.TotalProfit
	}

	for i := range rows {
		if rows[i].TotalRevenue > 0 {
			rows[i].ProfitMargin = float64(rows[i].TotalProfit) / float64(rows[i].TotalRevenue) * 100
		}
	}
	if grandTotal.TotalRevenue > 0 {
		grandTotal.ProfitMargin = float64(grandTotal.TotalProfit) / float64(grandTotal.TotalRevenue) * 100
	}

	return &ProfitReportResponse{
		StartDate:  query.StartDate,
		EndDate:    query.EndDate,
		Products:   rows,
		GrandTotal: grandTotal,
	}, nil
}