package prediction

import (
	"math"
	"strconv"
	"strings"
)

// formatQuantity mengonversi angka mentah (dalam satuan dasar) ke satuan yang
// lebih enak dibaca, tergantung jenis satuan dasarnya.
func formatQuantity(raw float64, baseUnitName string) (value string, unit string) {
	lower := strings.ToLower(strings.TrimSpace(baseUnitName))

	switch lower {
	case "gram", "gr", "g":
		if raw >= 1000 {
			return trimDecimal(raw/1000, 2), "Kg"
		}
		return trimDecimal(raw, 0), "Gram"
	case "mililiter", "ml":
		if raw >= 1000 {
			return trimDecimal(raw/1000, 2), "Liter"
		}
		return trimDecimal(raw, 0), "Ml"
	default:
		if baseUnitName == "" {
			baseUnitName = "Unit"
		}
		return trimDecimal(raw, 0), baseUnitName
	}
}

// trimDecimal membulatkan ke sejumlah desimal, lalu buang trailing zero
// (misal 2.50 → "2.5", 3.00 → "3")
func trimDecimal(val float64, decimals int) string {
	factor := math.Pow(10, float64(decimals))
	rounded := math.Round(val*factor) / factor
	return strconv.FormatFloat(rounded, 'f', -1, 64)
}