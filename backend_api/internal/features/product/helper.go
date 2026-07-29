package product

import "github.com/shopspring/decimal"

func decimalZero() decimal.Decimal {
	return decimal.NewFromInt(0)
}

func decimalFromUint(v uint) decimal.Decimal {
	return decimal.NewFromInt(int64(v))
}