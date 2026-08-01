package stockhistory

type Service struct {
	repo *Repository
}

func NewService() *Service {
	return &Service{repo: &Repository{}}
}

func (s *Service) GetByProductID(productID uint) ([]StockHistoryRow, error) {
	return s.repo.FindByProductID(productID)
}