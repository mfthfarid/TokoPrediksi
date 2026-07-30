package purchase

import (
	"errors"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// ConsumeStock mengurangi quantity_remaining dari purchase_items secara FIFO
// (paling lama masuk duluan). Kalau expiryDate diisi, cuma konsumsi dari batch
// dengan tanggal kadaluwarsa itu (dipakai fitur penyesuaian stok). Kalau nil,
// konsumsi dari batch mana saja (dipakai penjualan biasa).
// Return: total modal (cost) dari quantity yang dikonsumsi.
func ConsumeStock(tx *gorm.DB, productID uint, expiryDate *customtype.Date, quantityNeeded decimal.Decimal) (uint, error) {
	query := tx.Where("product_id = ? AND quantity_remaining > 0", productID)
	if expiryDate != nil {
		query = query.Where("tanggal_kadaluwarsa = ?", expiryDate.Time)
	}

	var batches []PurchaseItem
	if err := query.Order("id ASC").Find(&batches).Error; err != nil {
		return 0, err
	}

	remaining := quantityNeeded
	totalCost := decimal.Zero
	for _, batch := range batches {
		if remaining.LessThanOrEqual(decimal.Zero) {
			break
		}

		taken := decimal.Min(remaining, batch.QuantityRemaining)
		costForBatch := taken.Mul(decimal.NewFromInt(int64(batch.CostPerBase)))
		totalCost = totalCost.Add(costForBatch)

		newRemaining := batch.QuantityRemaining.Sub(taken)
		if err := tx.Model(&PurchaseItem{}).
			Where("id = ?", batch.ID).
			UpdateColumn("quantity_remaining", newRemaining).Error; err != nil {
			return 0, err
		}

		remaining = remaining.Sub(taken)
	}

	if remaining.GreaterThan(decimal.Zero) {
		return 0, errors.New("stok tidak cukup untuk produk ini")
	}

	return uint(totalCost.Round(0).IntPart()), nil
}