package reorder

import (
	"errors"
	"math"
)

type Service struct {
	repo *Repository
}

func NewService() *Service {
	return &Service{repo: &Repository{}}
}

// Calculate menghitung Safety Stock & Reorder Point berdasarkan hasil prediksi
// Prophet yang SUDAH TERSIMPAN (predictions table). yhat_upper - yhat dipakai
// sebagai representasi ketidakpastian permintaan (pengganti standar deviasi manual).
func (s *Service) Calculate(productID uint) (*ReorderInfo, error) {
	predictions, err := s.repo.GetPredictions(productID)
	if err != nil || len(predictions) == 0 {
		return nil, errors.New("belum ada data prediksi untuk produk ini, jalankan prediksi terlebih dahulu")
	}

	leadTimeDays, source := s.repo.GetLeadTime(productID)

	currentStock, err := s.repo.GetCurrentStock(productID)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}

	// Rata-rata permintaan harian & rata-rata "ketidakpastian" dari hasil prediksi
	var totalDemand, totalUncertainty float64
	for _, p := range predictions {
		totalDemand += float64(p.PredictedQuantity)
		if p.YhatUpper != nil {
			uncertainty := float64(*p.YhatUpper) - float64(p.PredictedQuantity)
			totalUncertainty += uncertainty
		}
	}
	n := float64(len(predictions))
	avgDailyDemand := totalDemand / n
	avgDailyUncertainty := totalUncertainty / n

	// Safety Stock = ketidakpastian harian × akar(lead time)
	// Reorder Point = (permintaan harian × lead time) + safety stock
	safetyStock := avgDailyUncertainty * math.Sqrt(float64(leadTimeDays))
	reorderPoint := (avgDailyDemand * float64(leadTimeDays)) + safetyStock

	return &ReorderInfo{
		ProductID:      productID,
		LeadTimeDays:   leadTimeDays,
		LeadTimeSource: source,
		SafetyStock:    math.Round(safetyStock*100) / 100,
		ReorderPoint:   math.Round(reorderPoint*100) / 100,
		CurrentStock:   currentStock,
		NeedsReorder:   currentStock <= reorderPoint,
	}, nil
}

// GetAllReorderAlerts memeriksa seluruh produk aktif dan mendeteksi apakah stoknya:
// 1. Masuk zona Safety Stock (0 < currentStock <= safetyStock) -> Kritis!
// 2. Mencapai Reorder Point (safetyStock < currentStock <= reorderPoint) -> Waktunya Reorder!
// Serta mengembalikan list checkedProductIDs agar tidak bentrok dengan notifikasi stok menipis biasa.
func (s *Service) GetAllReorderAlerts() (safetyStockAlerts []ReorderAlert, reorderPointAlerts []ReorderAlert, checkedProductIDs []uint, err error) {
	products, err := s.repo.GetAllActiveProducts()
	if err != nil {
		return nil, nil, nil, err
	}

	for _, p := range products {
		info, err := s.Calculate(p.ID)
		if err != nil {
			// Lewati produk yang belum memiliki data prediksi
			continue
		}

		checkedProductIDs = append(checkedProductIDs, p.ID)

		// Lewati stok 0 karena sudah ditangani notifikasi stok habis (stock_out)
		if p.Stock <= 0 {
			continue
		}

		if p.Stock <= info.SafetyStock {
			safetyStockAlerts = append(safetyStockAlerts, ReorderAlert{
				ProductID:    p.ID,
				ProductName:  p.Name,
				CurrentStock: p.Stock,
				SafetyStock:  info.SafetyStock,
				ReorderPoint: info.ReorderPoint,
			})
		} else if p.Stock <= info.ReorderPoint {
			reorderPointAlerts = append(reorderPointAlerts, ReorderAlert{
				ProductID:    p.ID,
				ProductName:  p.Name,
				CurrentStock: p.Stock,
				SafetyStock:  info.SafetyStock,
				ReorderPoint: info.ReorderPoint,
			})
		}
	}

	return safetyStockAlerts, reorderPointAlerts, checkedProductIDs, nil
}