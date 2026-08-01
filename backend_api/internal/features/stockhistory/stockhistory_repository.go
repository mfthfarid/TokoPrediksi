package stockhistory

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type Repository struct{}

func (r *Repository) FindByProductID(productID uint) ([]StockHistoryRow, error) {
	query := `
		SELECT purchases.purchase_date as event_date,
		       'masuk' as type,
		       purchase_items.quantity_base as quantity,
		       CONCAT('Pembelian', IFNULL(CONCAT(' dari ', suppliers.name), '')) as reference
		FROM purchase_items
		JOIN purchases ON purchases.id = purchase_items.purchase_id
		LEFT JOIN suppliers ON suppliers.id = purchases.supplier_id
		WHERE purchase_items.product_id = ?

		UNION ALL

		SELECT transactions.transaction_date as event_date,
		       'keluar' as type,
		       transaction_items.quantity_base as quantity,
		       'Penjualan' as reference
		FROM transaction_items
		JOIN transactions ON transactions.id = transaction_items.transaction_id
		WHERE transaction_items.product_id = ?

		UNION ALL

		SELECT stock_adjustments.created_at as event_date,
		       stock_adjustments.adjustment_type as type,
		       stock_adjustments.quantity_adjusted as quantity,
		       IFNULL(stock_adjustments.note,
		              CASE WHEN stock_adjustments.adjustment_type = 'retur' THEN 'Retur ke supplier' ELSE 'Kerugian' END
		       ) as reference
		FROM stock_adjustments
		WHERE stock_adjustments.product_id = ?

		ORDER BY event_date DESC
	`

	var rows []StockHistoryRow
	err := config.DB.Raw(query, productID, productID, productID).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for i := range rows {
		rows[i].Date = rows[i].EventDate.Format("02/01/2006")
	}

	return rows, nil
}