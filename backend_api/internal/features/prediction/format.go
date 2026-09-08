package prediction

import (
	"math"
	"strconv"
	"strings"
)

// determineDisplayUnit menentukan 1 satuan tampilan yang konsisten untuk 1 produk,
// berdasarkan angka PALING BESAR di antara stok dan rata-rata penjualan
// (supaya tidak ada field yang "gram" sementara field lain "kg" untuk produk yang sama).
func determineDisplayUnit(baseUnitName string, referenceValue float64) (divisor float64, unit string) {
	lower := strings.ToLower(strings.TrimSpace(baseUnitName))

	switch lower {
	case "gram", "gr", "g":
		if referenceValue >= 1000 {
			return 1000, "Kg"
		}
		return 1, "Gram"
	case "mililiter", "ml":
		if referenceValue >= 1000 {
			return 1000, "Liter"
		}
		return 1, "Ml"
	default:
		if baseUnitName == "" {
			baseUnitName = "Unit"
		}
		return 1, baseUnitName
	}
}

// formatWithDivisor memformat 1 angka pakai divisor & pembulatan yang SAMA
// dengan field lain di produk yang sama — konsisten, tidak dibulatkan ke 0 desimal.
func formatWithDivisor(raw, divisor float64) string {
	return trimDecimal(raw/divisor, 2)
}

func trimDecimal(val float64, decimals int) string {
	factor := math.Pow(10, float64(decimals))
	rounded := math.Round(val*factor) / factor
	return strconv.FormatFloat(rounded, 'f', -1, 64)
}