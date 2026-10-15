package reorder

import (
	"errors"
	"log"
	"math"
	"sort"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/prediction"
)

type Service struct {
	repo     *Repository
	predRepo *prediction.PredictionRepository
}

func NewService() *Service {
	return &Service{repo: &Repository{}, predRepo: &prediction.PredictionRepository{}}
}

// resolveT: T hasil hitung bila ada; kalau tidak, seed (L=3 → "seed", L lain → "seed_approx").
func (s *Service) resolveT(productID uint, leadTime int) (float64, string) {
	if t, _ := s.repo.FindTParam(productID, leadTime, "computed"); t != nil {
		return *t, "computed"
	}
	if t, _ := s.repo.FindTParam(productID, SeedLeadTimeDays, "seed"); t != nil {
		if leadTime == SeedLeadTimeDays {
			return *t, "seed"
		}
		return *t, "seed_approx"
	}
	return 0, "none"
}

func (s *Service) Calculate(productID uint) (*ReorderInfo, error) {
	name, stock, baseUnit, err := s.predRepo.GetProductInfo(productID)
	if err != nil || name == "" {
		return nil, errors.New("produk tidak ditemukan")
	}

	leadTime, ltSource := s.repo.GetLeadTime(productID)
	info := &ReorderInfo{
		ProductID:      productID,
		ProductName:    name,
		CurrentStock:   stock,
		LeadTimeDays:   leadTime,
		LeadTimeSource: ltSource,
		ServiceLevel:   float64(ServiceLevelPct) / 100,
		TSource:        "none",
		Status:         "unknown",
	}

	latest, _ := s.predRepo.LatestRunID(productID)
	info.HasPrediction = latest != ""
	if !info.HasPrediction {
		fillDisplay(info, baseUnit)
		return info, nil
	}

	// Utamakan run terbaru yang cukup panjang untuk rekomendasi (L+7 hari),
	// kalau tidak ada, run terbaru yang cukup untuk ROP (L hari).
	need := leadTime + ReviewIntervalDays
	runID, _ := s.repo.FindRunWithMinRows(productID, need)
	if runID == "" {
		runID, _ = s.repo.FindRunWithMinRows(productID, leadTime)
	}
	if runID == "" {
		info.PredictionStale = true
		fillDisplay(info, baseUnit)
		return info, nil
	}

	demand, err := s.repo.FutureDemand(productID, runID, need)
	if err != nil || len(demand) < leadTime {
		info.PredictionStale = true
		fillDisplay(info, baseUnit)
		return info, nil
	}

	t, tSource := s.resolveT(productID, leadTime)
	tEff := EffectiveT(t)
	info.TSource = tSource

	dl := demand[:leadTime]
	demandLT := sum(dl)
	rop := CalcROP(dl, tEff)
	info.DemandLeadTime = &demandLT
	info.SafetyStock = &tEff
	info.ReorderPoint = &rop
	info.Status = StatusFor(stock, rop, demandLT/float64(leadTime))
	info.NeedsReorder = info.Status == "below_rop"

	if len(demand) >= need {
		rec := math.Ceil(CalcRecommendedPurchase(demand[:need], tEff, stock))
		info.RecommendedPurchase = &rec
		info.RecommendationAvailable = info.Status == "below_rop" && rec > 0
	}

	fillDisplay(info, baseUnit)
	return info, nil
}

func (s *Service) CalculateAll() ([]ReorderInfo, error) {
	ids, err := s.predRepo.GetAllProductIDs()
	if err != nil {
		return nil, err
	}

	items := make([]ReorderInfo, 0, len(ids))
	for _, id := range ids {
		info, err := s.Calculate(id)
		if err != nil {
			continue
		}
		items = append(items, *info)
	}

	rank := map[string]int{"below_rop": 0, "near": 1, "safe": 2, "unknown": 3}
	sort.SliceStable(items, func(i, j int) bool {
		return rank[items[i].Status] < rank[items[j].Status]
	})
	return items, nil
}

func truncateDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}

// RecomputeT menghitung ulang T dari riwayat run: untuk tiap run dan tiap awal
// jendela hari ke-1..7 sejak run dibuat, error = aktual - prediksi (total L hari).
// T = kuantil 95% dari semua error. Hanya disimpan bila run yang berkontribusi >= MinRunsForComputedT.
func (s *Service) RecomputeT(productID uint) (updated bool, usedRuns int, err error) {
	leadTime, _ := s.repo.GetLeadTime(productID)

	runs, err := s.repo.ListRuns(productID)
	if err != nil {
		return false, 0, err
	}

	sales, err := s.predRepo.GetDailySales(productID)
	if err != nil {
		return false, 0, err
	}
	actual := make(map[string]float64, len(sales))
	for _, d := range sales {
		actual[d.DS] = d.Y
	}

	today := truncateDay(time.Now())
	var errs []float64

	for _, run := range runs {
		preds, perr := s.repo.RunPredictions(productID, run.RunID)
		if perr != nil || len(preds) == 0 {
			continue
		}

		c0 := truncateDay(run.CreatedAt)
		contributed := false

		for offset := 1; offset <= ReviewIntervalDays; offset++ {
			start := c0.AddDate(0, 0, offset)
			end := start.AddDate(0, 0, leadTime-1)
			if !end.Before(today) {
				continue // jendela belum selesai
			}

			predTotal, actTotal, complete := 0.0, 0.0, true
			for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
				key := d.Format("2006-01-02")
				p, ok := preds[key]
				if !ok {
					complete = false
					break
				}
				predTotal += p
				actTotal += actual[key] // hari tanpa transaksi dihitung 0
			}
			if !complete {
				continue
			}
			errs = append(errs, actTotal-predTotal)
			contributed = true
		}
		if contributed {
			usedRuns++
		}
	}

	if usedRuns < MinRunsForComputedT {
		return false, usedRuns, nil
	}

	t := Quantile(errs, float64(ServiceLevelPct)/100)
	if err := s.repo.UpsertTParam(productID, leadTime, "computed", t, len(errs)); err != nil {
		return false, usedRuns, err
	}
	return true, usedRuns, nil
}

func (s *Service) RecomputeAllT() int {
	ids, err := s.predRepo.GetAllProductIDs()
	if err != nil {
		return 0
	}
	updatedCount := 0
	for _, id := range ids {
		updated, runs, err := s.RecomputeT(id)
		if err != nil {
			log.Printf("Hitung ulang T produk %d gagal: %v\n", id, err)
			continue
		}
		if updated {
			updatedCount++
		} else {
			log.Printf("T produk %d belum dihitung ulang (run berkontribusi: %d, minimal %d)\n", id, runs, MinRunsForComputedT)
		}
	}
	return updatedCount
}

func fillDisplay(info *ReorderInfo, baseUnit string) {
	ref := info.CurrentStock
	for _, p := range []*float64{info.DemandLeadTime, info.ReorderPoint, info.RecommendedPurchase} {
		if p != nil && *p > ref {
			ref = *p
		}
	}
	divisor, unit := prediction.DetermineDisplayUnit(baseUnit, ref)
	countUnit := divisor == 1 && unit != "Gram" && unit != "Ml" // satuan hitungan: bulatkan ke atas

	info.DisplayUnit = unit
	info.CurrentStockDisplay = prediction.FormatWithDivisor(info.CurrentStock, divisor)
	info.DemandLeadTimeDisplay = fmtPtr(info.DemandLeadTime, divisor, countUnit)
	info.SafetyStockDisplay = fmtPtr(info.SafetyStock, divisor, countUnit)
	info.ReorderPointDisplay = fmtPtr(info.ReorderPoint, divisor, countUnit)
	info.RecommendedPurchaseDisplay = fmtPtr(info.RecommendedPurchase, divisor, countUnit)
}

func fmtPtr(p *float64, divisor float64, ceilToInt bool) string {
	if p == nil {
		return ""
	}
	v := *p
	if ceilToInt {
		v = math.Ceil(v)
	}
	return prediction.FormatWithDivisor(v, divisor)
}

// GetAllReorderAlerts memisahkan produk unggulan yang sudah masuk zona safety stock
// (stok ≤ safety stock) dari yang baru mencapai reorder point (safety stock < stok ≤ ROP).
// checkedIDs = produk yang punya ROP valid, supaya alert "stok menipis" biasa tidak menggandakan.
func (s *Service) GetAllReorderAlerts() (safetyStockAlerts []ReorderInfo, reorderPointAlerts []ReorderInfo, checkedIDs []uint, err error) {
	items, err := s.CalculateAll()
	if err != nil {
		return nil, nil, nil, err
	}

	for _, it := range items {
		if it.ReorderPoint == nil || it.SafetyStock == nil {
			continue // belum ada prediksi / prediksi usang: ROP belum bisa dihitung
		}
		checkedIDs = append(checkedIDs, it.ProductID)

		switch {
		case it.CurrentStock <= *it.SafetyStock:
			safetyStockAlerts = append(safetyStockAlerts, it)
		case it.CurrentStock <= *it.ReorderPoint:
			reorderPointAlerts = append(reorderPointAlerts, it)
		}
	}
	return safetyStockAlerts, reorderPointAlerts, checkedIDs, nil
}