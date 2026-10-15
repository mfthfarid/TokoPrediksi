package dashboard

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/reorder"

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

	reorderItems, err := reorder.NewService().CalculateAll()
	if err != nil {
		return nil, err
	}
	reorderNeeded := 0
	for _, it := range reorderItems {
		if it.Status == "below_rop" {
			reorderNeeded++
		}
	}

	return &DashboardSummary{
		TotalSalesToday:        totalSales,
		TotalTransactionsToday: totalTransactions,
		TotalProfitToday:       totalProfit,
		ProfitMarginToday:      margin,
		LowStockCount:          lowStockCount,
		LowStockProducts:       lowStock,
		TopSellingProducts:     topSelling,
		PredictedStockoutCount: reorderNeeded, // sementara, agar frontend lama tidak patah
		ReorderNeededCount:     reorderNeeded,
	}, nil
}