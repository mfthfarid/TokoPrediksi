package dashboard

type DashboardService struct {
	repo *DashboardRepository
}

func NewDashboardService() *DashboardService {
	return &DashboardService{repo: &DashboardRepository{}}
}

func (s *DashboardService) GetSummary() (*DashboardSummary, error) {
	totalSales, err := s.repo.GetTotalSalesToday()
	if err != nil {
		return nil, err
	}

	totalTransactions, err := s.repo.GetTotalTransactionsToday()
	if err != nil {
		return nil, err
	}

	totalProfit, err := s.repo.GetTotalProfitToday()
	if err != nil {
		return nil, err
	}

	var margin float64
	if totalSales > 0 {
		margin = float64(totalProfit) / float64(totalSales) * 100
	}

	lowStockCount, err := s.repo.GetLowStockCount()
	if err != nil {
		return nil, err
	}

	lowStock, err := s.repo.GetLowStockProducts()
	if err != nil {
		return nil, err
	}

	topSelling, err := s.repo.GetTopSellingProducts(5)
	if err != nil {
		return nil, err
	}

	stockoutCount, err := s.repo.GetPredictedStockoutCount()
	if err != nil {
		return nil, err
	}

	return &DashboardSummary{
		TotalSalesToday:        totalSales,
		TotalTransactionsToday: totalTransactions,
		TotalProfitToday:       totalProfit,
		ProfitMarginToday:      margin,
		LowStockCount:          lowStockCount,
		LowStockProducts:       lowStock,
		TopSellingProducts:     topSelling,
		PredictedStockoutCount: stockoutCount,
	}, nil
}