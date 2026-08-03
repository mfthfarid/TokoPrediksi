package stockhistory

import "time"

type StockHistoryRow struct {
	EventDate time.Time `json:"-"`
	Date      string    `json:"date"` // format: DD/MM/YYYY HH:mm
	Type      string    `json:"type"` // masuk | keluar | retur | rugi
	Quantity  float64   `json:"quantity"`
	Reference string    `json:"reference"`
}