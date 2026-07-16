package prediction

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
)

const (
	minHistoryPoints = 14
	modelVersion     = "prophet-v1"
)

type PredictionService struct {
	repo *PredictionRepository
}

func NewPredictionService() *PredictionService {
	return &PredictionService{repo: &PredictionRepository{}}
}

func (s *PredictionService) Predict(productID uint, periods int) ([]Prediction, error) {
	if periods <= 0 {
		periods = 7
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

	// Prediksi lama untuk produk ini diganti total dengan hasil terbaru
	if err := s.repo.DeleteByProductID(productID); err != nil {
		return nil, err
	}

	toSave := make([]Prediction, 0, len(points))
	for _, p := range points {
		date, err := time.Parse("2006-01-02", p.DS)
		if err != nil {
			continue // lewati baris yang formatnya rusak, jangan gagalkan semua
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
	return toSave, nil
}

func (s *PredictionService) GetByProductID(productID uint) ([]Prediction, error) {
	return s.repo.FindByProductID(productID)
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