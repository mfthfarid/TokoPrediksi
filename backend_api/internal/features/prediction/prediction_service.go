package prediction

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"os"
	"sort"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/notification"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
)

const (
	minHistoryPoints   = 14
	modelVersion       = "prophet-v1"
	defaultPeriods     = 7
	urgencyHighDays    = 3
	urgencyMediumDays  = 7
	maxPeriodsRatio    = 0.3 // maksimal 30% dari panjang data historis
	absoluteMaxPeriods = 90  // batas atas mutlak, berapa pun panjang datanya
)

type PredictionService struct {
	repo *PredictionRepository
}

func NewPredictionService() *PredictionService {
	return &PredictionService{repo: &PredictionRepository{}}
}

func (s *PredictionService) GetSummary() ([]PredictionSummaryItem, error) {
	rows, err := s.repo.GetSummaryRaw()
	if err != nil {
		return nil, err
	}

	items := make([]PredictionSummaryItem, len(rows))
	for i, row := range rows {
		item := PredictionSummaryItem{
			ProductID:         row.ProductID,
			ProductName:       row.ProductName,
			CurrentStock:      row.CurrentStock,
			AverageDailySales: row.AverageDailySales,
			HasPrediction:     row.HasPrediction,
			Urgency:           "rendah",
		}

		if row.AverageDailySales > 0 {
			d := math.Round((row.CurrentStock/row.AverageDailySales)*10) / 10
			item.DaysRemaining = &d
			switch {
			case d <= urgencyHighDays:
				item.Urgency = "tinggi"
			case d <= urgencyMediumDays:
				item.Urgency = "sedang"
			default:
				item.Urgency = "rendah"
			}
		}
		items[i] = item
	}

	urgencyRank := map[string]int{"tinggi": 0, "sedang": 1, "rendah": 2}
	sort.Slice(items, func(i, j int) bool {
		ri, rj := urgencyRank[items[i].Urgency], urgencyRank[items[j].Urgency]
		if ri != rj {
			return ri < rj
		}
		if items[i].DaysRemaining == nil {
			return false
		}
		if items[j].DaysRemaining == nil {
			return true
		}
		return *items[i].DaysRemaining < *items[j].DaysRemaining
	})

	return items, nil
}

func calculateMaxPeriods(historyLength int) int {
	max := int(float64(historyLength) * maxPeriodsRatio)
	if max < defaultPeriods {
		max = defaultPeriods // minimal tetap boleh prediksi 7 hari walau data historis pendek
	}
	if max > absoluteMaxPeriods {
		max = absoluteMaxPeriods
	}
	return max
}

func (s *PredictionService) Predict(productID uint, periods int) (*PredictionSummaryResponse, error) {
	if periods <= 0 {
		periods = defaultPeriods
	}

	dailySales, err := s.repo.GetDailySales(productID)
	if err != nil {
		return nil, err
	}
	if len(dailySales) < minHistoryPoints {
		return nil, fmt.Errorf(
			"data histori penjualan belum cukup untuk prediksi (minimal %d hari ada transaksi, saat ini baru %d)",
			minHistoryPoints, len(dailySales),
		)
	}

	maxAllowedPeriods := calculateMaxPeriods(len(dailySales))
	if periods > maxAllowedPeriods {
		return nil, fmt.Errorf(
			"periode prediksi maksimal %d hari untuk data historis sepanjang ini (diminta %d hari). Data historis yang lebih panjang memungkinkan prediksi jangka lebih jauh",
			maxAllowedPeriods, periods,
		)
	}

	history := make([]pythonHistoryPoint, len(dailySales))
	for i, d := range dailySales {
		history[i] = pythonHistoryPoint{DS: d.DS, Y: d.Y}
	}

	points, err := callPythonPredict(pythonPredictRequest{
		ProductID: productID,
		History:   history,
		Periods:   periods,
	})
	if err != nil {
		return nil, err
	}

	if err := s.repo.DeleteByProductID(productID); err != nil {
		return nil, err
	}

	toSave := make([]Prediction, 0, len(points))
	for _, p := range points {
		date, err := time.Parse("2006-01-02", p.DS)
		if err != nil {
			continue
		}

		yhat := int(p.Yhat)
		lower := int(p.YhatLower)
		upper := int(p.YhatUpper)
		version := modelVersion

		toSave = append(toSave, Prediction{
			ProductID:         productID,
			PredictionDate:    customtype.Date{Time: date},
			PredictedQuantity: yhat,
			YhatLower:         &lower,
			YhatUpper:         &upper,
			ModelVersion:      &version,
		})
	}

	if err := s.repo.CreateBatch(toSave); err != nil {
		return nil, err
	}

	return s.buildSummary(productID, toSave, dailySales)
}

func (s *PredictionService) PredictAll(periods int) error {
	if periods <= 0 {
		periods = defaultPeriods
	}

	productIDs, err := s.repo.GetAllProductIDs()
	if err != nil {
		return err
	}

	go func() {
		fmt.Println("Memulai prediksi massal untuk", len(productIDs), "produk...")
		successCount := 0
		failCount := 0

		for _, id := range productIDs {
			_, err := s.Predict(id, periods)
			if err != nil {
				fmt.Printf("❌ [Produk ID: %d] Gagal: %v\n", id, err)
				failCount++
				continue
			}
			fmt.Printf("✅ [Produk ID: %d] Berhasil diprediksi\n", id)
			successCount++
		}

		fmt.Printf("🏁 Prediksi massal selesai! Berhasil: %d, Gagal: %d\n", successCount, failCount)

		// Kirim notifikasi ringkasan setelah semua selesai
		summary, err := s.GetSummary()
		notifService := notification.NewService()

		if err != nil {
			notifService.Broadcast(
				"Prediksi Mingguan Selesai",
				fmt.Sprintf("%d produk berhasil diprediksi.", successCount),
				"prediction_complete",
			)
			return
		}

		urgentCount := 0
		for _, item := range summary {
			if item.Urgency == "tinggi" {
				urgentCount++
			}
		}

		body := fmt.Sprintf("%d produk berhasil diprediksi.", successCount)
		if urgentCount > 0 {
			body = fmt.Sprintf("%s %d produk perlu segera direstok!", body, urgentCount)
		}

		notifService.Broadcast("Prediksi Mingguan Selesai", body, "prediction_complete")
	}()

	return nil
}

func (s *PredictionService) GetByProductID(productID uint) (*PredictionSummaryResponse, error) {
	predictions, err := s.repo.FindByProductID(productID)
	if err != nil {
		return nil, err
	}

	dailySales, err := s.repo.GetDailySales(productID)
	if err != nil {
		return nil, err
	}

	return s.buildSummary(productID, predictions, dailySales)
}

func (s *PredictionService) buildSummary(productID uint, predictions []Prediction, dailySales []DailySales) (*PredictionSummaryResponse, error) {
	name, stock, err := s.repo.GetProductInfo(productID)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}

	var avgSales float64
	if len(dailySales) > 0 {
		var total float64
		for _, d := range dailySales {
			total += d.Y
		}
		avgSales = math.Round((total/float64(len(dailySales)))*100) / 100
	}

	var daysRemaining *float64
	urgency := "rendah"
	if avgSales > 0 {
		d := math.Round((stock/avgSales)*10) / 10
		daysRemaining = &d
		switch {
		case d <= urgencyHighDays:
			urgency = "tinggi"
		case d <= urgencyMediumDays:
			urgency = "sedang"
		default:
			urgency = "rendah"
		}
	}

	var totalPredictedDemand int
	for _, p := range predictions {
		totalPredictedDemand += p.PredictedQuantity
	}
	recommendedRestock := totalPredictedDemand - int(stock)
	if recommendedRestock < 0 {
		recommendedRestock = 0
	}

	actualPoints := make([]ChartPoint, len(dailySales))
	for i, d := range dailySales {
		t, _ := time.Parse("2006-01-02", d.DS)
		actualPoints[i] = ChartPoint{Date: t.Format("02/01/2006"), Quantity: d.Y}
	}

	predictedPoints := make([]ChartPredictedPoint, len(predictions))
	for i, p := range predictions {
		predictedPoints[i] = ChartPredictedPoint{
			Date:     p.PredictionDate.Time.Format("02/01/2006"),
			Quantity: p.PredictedQuantity,
			Lower:    p.YhatLower,
			Upper:    p.YhatUpper,
		}
	}

	return &PredictionSummaryResponse{
		ProductID:                  productID,
		ProductName:                name,
		HasPrediction:              len(predictions) > 0,
		CurrentStock:               stock,
		AverageDailySales:          avgSales,
		DaysRemaining:              daysRemaining,
		Urgency:                    urgency,
		RecommendedRestockQuantity: recommendedRestock,
		ChartData: ChartData{
			Actual:    actualPoints,
			Predicted: predictedPoints,
		},
		Predictions: predictions,
	}, nil
}

func callPythonPredict(reqBody pythonPredictRequest) ([]pythonPredictionPoint, error) {
	url := os.Getenv("PREDICTION_SERVICE_URL")
	if url == "" {
		url = "http://localhost:8000/predict"
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, errors.New("gagal menghubungi service prediksi, pastikan service Python sedang berjalan")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("service prediksi mengembalikan error (status %d)", resp.StatusCode)
	}

	var result pythonPredictResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, errors.New("gagal membaca respons dari service prediksi")
	}
	return result.Predictions, nil
}