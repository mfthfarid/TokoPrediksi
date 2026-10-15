package reorder

import (
	"math"
	"sort"
)

const (
	ServiceLevelPct     = 95 // 0,95. Dokumen bilang belum final; kalau diubah, semua T harus dihitung ulang.
	SeedLeadTimeDays    = 3  // seed T hanya valid untuk L=3 dan service level 95%
	DefaultLeadTimeDays = 3
	ReviewIntervalDays  = 7 // jarak antar prediksi (cron mingguan)
	MinRunsForComputedT = 12
	NearRopDays         = 2
)

func sum(xs []float64) float64 {
	total := 0.0
	for _, x := range xs {
		total += x
	}
	return total
}

// CalcROP sesuai dokumen: ROP = max(0, jumlah prediksi harian + T).
func CalcROP(dailyDemand []float64, t float64) float64 {
	return math.Max(0, sum(dailyDemand)+t)
}

// EffectiveT adalah kebijakan: T negatif tidak dipakai (safety stock minimal 0).
func EffectiveT(t float64) float64 {
	return math.Max(0, t)
}

// CalcRecommendedPurchase = max(0, D(L+7) + T - stok).
func CalcRecommendedPurchase(dailyDemand []float64, t, stock float64) float64 {
	return math.Max(0, sum(dailyDemand)+t-stock)
}

// Quantile memakai interpolasi linear (sama dengan default numpy.quantile).
// Kalau notebook memakai metode lain, samakan di sini.
func Quantile(values []float64, q float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sorted := append([]float64(nil), values...)
	sort.Float64s(sorted)
	if len(sorted) == 1 {
		return sorted[0]
	}
	pos := q * float64(len(sorted)-1)
	lo := int(math.Floor(pos))
	hi := int(math.Ceil(pos))
	if lo == hi {
		return sorted[lo]
	}
	return sorted[lo] + (sorted[hi]-sorted[lo])*(pos-float64(lo))
}

func StatusFor(stock, rop, avgDaily float64) string {
	switch {
	case stock <= rop:
		return "below_rop"
	case stock <= rop+NearRopDays*avgDaily:
		return "near"
	default:
		return "safe"
	}
}