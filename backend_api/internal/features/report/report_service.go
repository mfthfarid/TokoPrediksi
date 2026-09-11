package report

import "time"

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

	revenue, cost, profit, transactions, items, err := s.repo.GetOverallTotals(query.StartDate, query.EndDate)
	if err != nil {
		return nil, err
	}

	var margin float64
	if revenue > 0 {
		margin = float64(profit) / float64(revenue) * 100
	}

	for i := range rows {
		if rows[i].TotalRevenue > 0 {
			rows[i].ProfitMargin = float64(rows[i].TotalProfit) / float64(rows[i].TotalRevenue) * 100
		}
	}

	grandTotal := GrandTotal{
		TotalRevenue:      revenue,
		TotalCost:         cost,
		TotalProfit:       profit,
		ProfitMargin:      margin,
		TotalTransactions: transactions,
		TotalItemsSold:    items,
	}

	comparison, err := s.calculateComparison(query.StartDate, query.EndDate, revenue, profit)
	if err != nil {
		// kalau gagal hitung pembanding, tetap tampilkan laporan utama tanpa perbandingan
		comparison = PeriodComparison{}
	}

	return &ProfitReportResponse{
		StartDate:  query.StartDate,
		EndDate:    query.EndDate,
		Products:   rows,
		GrandTotal: grandTotal,
		Comparison: comparison,
	}, nil
}

// calculateComparison menghitung periode sebelumnya dengan PANJANG YANG SAMA,
// tepat sebelum periode yang diminta. Contoh: kalau user pilih 1-11 Sep (11 hari),
// pembandingnya otomatis 21-31 Agustus (11 hari sebelumnya).
func (s *ReportService) calculateComparison(startDate, endDate string, currentRevenue, currentProfit int) (PeriodComparison, error) {
	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return PeriodComparison{}, err
	}
	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return PeriodComparison{}, err
	}

	duration := end.Sub(start)
	prevEnd := start.AddDate(0, 0, -1)
	prevStart := prevEnd.Add(-duration)

	prevRevenue, _, prevProfit, _, _, err := s.repo.GetOverallTotals(
		prevStart.Format("2006-01-02"),
		prevEnd.Format("2006-01-02"),
	)
	if err != nil {
		return PeriodComparison{}, err
	}

	comparison := PeriodComparison{}
	if prevRevenue > 0 {
		v := (float64(currentRevenue) - float64(prevRevenue)) / float64(prevRevenue) * 100
		comparison.RevenueChangePercent = &v
	}
	if prevProfit > 0 {
		v := (float64(currentProfit) - float64(prevProfit)) / float64(prevProfit) * 100
		comparison.ProfitChangePercent = &v
	}

	return comparison, nil
}