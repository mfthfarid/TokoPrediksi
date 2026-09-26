package report

import (
	"fmt"
	"strings"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
)

type ReportRepository struct{}

func normalizeDateRange(startDate, endDate string) (string, string) {
	start := startDate
	if len(start) == 10 && !strings.Contains(start, " ") {
		start = fmt.Sprintf("%s 00:00:00", start)
	}

	end := endDate
	if len(end) == 10 && !strings.Contains(end, " ") {
		end = fmt.Sprintf("%s 23:59:59", end)
	}

	return start, end
}

func (r *ReportRepository) GetProfitByProduct(startDate, endDate string, productID *uint) ([]ProductProfitRow, error) {
	start, end := normalizeDateRange(startDate, endDate)

	query := config.DB.Table("transaction_items").
		Select(`
			products.id as product_id,
			products.name as product_name,
			SUM(transaction_items.quantity_base) as total_qty,
			SUM(transaction_items.subtotal) as total_revenue,
			SUM(transaction_items.cost_price * transaction_items.quantity) as total_cost,
			SUM(CAST(transaction_items.subtotal AS SIGNED) - CAST(transaction_items.cost_price * transaction_items.quantity AS SIGNED)) as total_profit
		`).
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Joins("JOIN products ON products.id = transaction_items.product_id").
		Where("transactions.transaction_date BETWEEN ? AND ?", start, end)

	if productID != nil {
		query = query.Where("transaction_items.product_id = ?", *productID)
	}

	var rows []ProductProfitRow
	err := query.
		Group("products.id, products.name").
		Order("total_profit DESC").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}

// GetOverallTotals menghitung total keseluruhan tanpa peduli beda satuan produk —
// aman dijumlah karena berbasis Rupiah & hitungan transaksi/baris, bukan quantity fisik.
func (r *ReportRepository) GetOverallTotals(startDate, endDate string) (revenue, cost, profit, transactions, items int, err error) {
	start, end := normalizeDateRange(startDate, endDate)

	type result struct {
		Revenue      int
		Cost         int
		Profit       int
		Transactions int
		Items        int
	}
	var res result

	err = config.DB.Table("transaction_items").
		Select(`
			COALESCE(SUM(transaction_items.subtotal), 0) as revenue,
			COALESCE(SUM(transaction_items.cost_price * transaction_items.quantity), 0) as cost,
			COALESCE(SUM(CAST(transaction_items.subtotal AS SIGNED) - CAST(transaction_items.cost_price * transaction_items.quantity AS SIGNED)), 0) as profit,
			COUNT(DISTINCT transaction_items.transaction_id) as transactions,
			COUNT(*) as items
		`).
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.transaction_date BETWEEN ? AND ?", start, end).
		Scan(&res).Error

	return res.Revenue, res.Cost, res.Profit, res.Transactions, res.Items, err
}