package prediction

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"sort"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
)

const (
	minHistoryPoints     = 14
	fallbackModelVersion = "prophet-v1"
	defaultPeriods       = 7
	urgencyHighDays      = 3
	urgencyMediumDays    = 7
	maxPeriodsRatio      = 0.3
	absoluteMaxPeriods   = 90
	gapThresholdDays     = 30
)

type PredictionService struct {
	repo *PredictionRepository
}

func NewPredictionService() *PredictionService {
	return &PredictionService{repo: &PredictionRepository{}}
}

func newRunID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func round2(v float64) float64 {
	return math.Round(v*100) / 100
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

		reference := math.Max(row.CurrentStock, row.AverageDailySales)
		divisor, displayUnit := DetermineDisplayUnit(row.BaseUnitName, reference)
		item.DisplayUnit = displayUnit
		item.CurrentStockDisplay = FormatWithDivisor(row.CurrentStock, divisor)
		item.AverageDailySalesDisplay = FormatWithDivisor(row.AverageDailySales, divisor)

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

func (s *PredictionService) Predict(productID uint, periods int) (*PredictionSummaryResponse, error) {
	enabled, err := s.repo.IsPredictionEnabled(productID)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}
	if !enabled {
		return nil, errors.New("prediksi hanya tersedia untuk produk unggulan yang telah dianalisis")
	}

	if periods <= 0 {
		periods = defaultPeriods
	}

	dailySales, err := s.repo.GetDailySales(productID)
	if err != nil {
		return nil, err
	}
	dailySales = fillMissingDates(dailySales)

	if len(dailySales) < minHistoryPoints {
		return nil, fmt.Errorf(
			"data histori penjualan belum cukup untuk prediksi (minimal %d hari ada transaksi, saat ini baru %d)",
			minHistoryPoints, len(dailySales),
		)
	}

	maxAllowed := calculateMaxPeriods(len(dailySales))
	if periods > maxAllowed {
		return nil, fmt.Errorf(
			"periode prediksi maksimal %d hari untuk data historis sepanjang ini (diminta %d hari)",
			maxAllowed, periods,
		)
	}

	history := make([]pythonHistoryPoint, len(dailySales))
	for i, d := range dailySales {
		history[i] = pythonHistoryPoint{DS: d.DS, Y: d.Y}
	}

	points, modelVersion, err := callPythonPredict(pythonPredictRequest{
		ProductID: productID,
		History:   history,
		Periods:   periods,
	})
	if err != nil {
		return nil, err
	}
	if modelVersion == "" {
		modelVersion = fallbackModelVersion
	}

	runID := newRunID()
	toSave := make([]Prediction, 0, len(points))
	for _, p := range points {
		date, err := time.Parse("2006-01-02", p.DS)
		if err != nil {
			continue
		}

		yhat := round2(p.Yhat)
		lower := round2(p.YhatLower)
		upper := round2(p.YhatUpper)
		version := modelVersion

		toSave = append(toSave, Prediction{
			RunID:             runID,
			ProductID:         productID,
			PredictionDate:    customtype.Date{Time: date},
			PredictedQuantity: yhat,
			YhatLower:         &lower,
			YhatUpper:         &upper,
			ModelVersion:      &version,
		})
	}
	if len(toSave) == 0 {
		return nil, errors.New("service prediksi tidak mengembalikan hasil yang valid")
	}

	if err := s.repo.CreateBatch(toSave); err != nil {
		return nil, err
	}

	return s.buildSummary(productID, toSave, dailySales)
}

// PredictAllSync berjalan sinkron (dipakai cron). Mengembalikan jumlah sukses & gagal.
func (s *PredictionService) PredictAllSync(periods int) (success int, failed int, err error) {
	if periods <= 0 {
		periods = defaultPeriods
	}

	ids, err := s.repo.GetAllProductIDs()
	if err != nil {
		return 0, 0, err
	}

	for _, id := range ids {
		if _, perr := s.Predict(id, periods); perr != nil {
			log.Printf("❌ [Produk ID: %d] Gagal: %v\n", id, perr)
			failed++
			continue
		}
		log.Printf("✅ [Produk ID: %d] Berhasil diprediksi\n", id)
		success++
	}
	return success, failed, nil
}

// PredictAll dipakai endpoint bulk: langsung membalas, proses jalan di background.
func (s *PredictionService) PredictAll(periods int) error {
	if _, err := s.repo.GetAllProductIDs(); err != nil {
		return err
	}
	go func() {
		success, failed, err := s.PredictAllSync(periods)
		if err != nil {
			log.Println("Prediksi massal gagal:", err)
			return
		}
		log.Printf("🏁 Prediksi massal selesai. Berhasil: %d, Gagal: %d\n", success, failed)
	}()
	return nil
}

func (s *PredictionService) GetByProductID(productID uint) (*PredictionSummaryResponse, error) {
	predictions, err := s.repo.FindLatestRun(productID) // hanya run terbaru
	if err != nil {
		return nil, err
	}

	dailySales, err := s.repo.GetDailySales(productID)
	if err != nil {
		return nil, err
	}
	dailySales = fillMissingDates(dailySales)

	return s.buildSummary(productID, predictions, dailySales)
}

func (s *PredictionService) buildSummary(productID uint, predictions []Prediction, dailySales []DailySales) (*PredictionSummaryResponse, error) {
	name, stock, baseUnitName, err := s.repo.GetProductInfo(productID)
	if err != nil || name == "" {
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

	var runID, generatedAt string
	if len(predictions) > 0 {
		runID = predictions[0].RunID
		generatedAt = predictions[0].CreatedAt.Format("02/01/2006 15:04")
	}

	reference := math.Max(stock, avgSales)
	divisor, displayUnit := DetermineDisplayUnit(baseUnitName, reference)

	return &PredictionSummaryResponse{
		ProductID:         productID,
		ProductName:       name,
		HasPrediction:     len(predictions) > 0,
		RunID:             runID,
		GeneratedAt:       generatedAt,
		CurrentStock:      stock,
		AverageDailySales: avgSales,
		DaysRemaining:     daysRemaining,
		Urgency:           urgency,
		ChartData: ChartData{
			Actual:    actualPoints,
			Predicted: predictedPoints,
		},
		Predictions:              predictions,
		DisplayUnit:              displayUnit,
		CurrentStockDisplay:      FormatWithDivisor(stock, divisor),
		AverageDailySalesDisplay: FormatWithDivisor(avgSales, divisor),
	}, nil
}

func calculateMaxPeriods(historyLength int) int {
	max := int(float64(historyLength) * maxPeriodsRatio)
	if max < defaultPeriods {
		max = defaultPeriods
	}
	if max > absoluteMaxPeriods {
		max = absoluteMaxPeriods
	}
	return max
}

type FilledPoint struct {
	DS       string
	Y        float64
	IsFilled bool
}

type parsedPoint struct {
	Date time.Time
	Y    float64
}

// FillDateRange mengisi semua tanggal antara start dan end, menandai IsFilled=true jika tidak ada di data asli.
func FillDateRange(sparse []DailySales, start, end time.Time) []FilledPoint {
	existing := make(map[string]float64, len(sparse))
	for _, d := range sparse {
		existing[d.DS] = d.Y
	}
	var result []FilledPoint
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		ds := d.Format("2006-01-02")
		y, exists := existing[ds]
		result = append(result, FilledPoint{DS: ds, Y: y, IsFilled: !exists})
	}
	return result
}

func fillMissingDates(sparse []DailySales) []DailySales {
	filled := fillMissingDatesClustered(sparse)
	result := make([]DailySales, len(filled))
	for i, f := range filled {
		result[i] = DailySales{DS: f.DS, Y: f.Y}
	}
	return result
}

// Isi 0 hanya DI DALAM klaster data; celah > gapThresholdDays dianggap jeda pencatatan.
func fillMissingDatesClustered(sparse []DailySales) []FilledPoint {
	if len(sparse) == 0 {
		return nil
	}

	parsed := make([]parsedPoint, len(sparse))
	for i, d := range sparse {
		t, _ := time.Parse("2006-01-02", d.DS)
		parsed[i] = parsedPoint{Date: t, Y: d.Y}
	}

	var result []FilledPoint
	clusterStart := 0
	for i := 1; i <= len(parsed); i++ {
		isBoundary := i == len(parsed) ||
			parsed[i].Date.Sub(parsed[i-1].Date).Hours()/24 > gapThresholdDays
		if isBoundary {
			result = append(result, fillCluster(parsed[clusterStart:i])...)
			clusterStart = i
		}
	}
	return result
}

func fillCluster(cluster []parsedPoint) []FilledPoint {
	existing := make(map[string]float64, len(cluster))
	for _, p := range cluster {
		existing[p.Date.Format("2006-01-02")] = p.Y
	}

	start := cluster[0].Date
	end := cluster[len(cluster)-1].Date

	var filled []FilledPoint
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")
		y, exists := existing[dateStr]
		filled = append(filled, FilledPoint{DS: dateStr, Y: y, IsFilled: !exists})
	}
	return filled
}

func callPythonPredict(reqBody pythonPredictRequest) ([]pythonPredictionPoint, string, error) {
	url := os.Getenv("PREDICTION_SERVICE_URL")
	if url == "" {
		url = "http://localhost:8000/predict"
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, "", err
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, "", errors.New("gagal menghubungi service prediksi, pastikan service Python sedang berjalan")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("service prediksi mengembalikan error (status %d)", resp.StatusCode)
	}

	var result pythonPredictResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, "", errors.New("gagal membaca respons dari service prediksi")
	}
	return result.Predictions, result.ModelVersion, nil
}