package prediction

import (
	"math"
	"strconv"
	"strings"
)

// DetermineDisplayUnit menentukan 1 satuan tampilan konsisten untuk 1 produk.
func DetermineDisplayUnit(baseUnitName string, referenceValue float64) (divisor float64, unit string) {
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

func FormatWithDivisor(raw, divisor float64) string {
	return TrimDecimal(raw/divisor, 2)
}

func TrimDecimal(val float64, decimals int) string {
	factor := math.Pow(10, float64(decimals))
	rounded := math.Round(val*factor) / factor
	return strconv.FormatFloat(rounded, 'f', -1, 64)
}