package customtype

import (
	"database/sql/driver"
	"fmt"
	"time"
)

const dateLayout = "02/01/2006" // DD/MM/YYYY

// Date adalah pembungkus time.Time yang JSON-nya format Indonesia "DD/MM/YYYY"
type Date struct {
	time.Time
}

func (d *Date) UnmarshalJSON(b []byte) error {
	s := string(b)
	if len(s) >= 2 {
		s = s[1 : len(s)-1]
	}
	if s == "" || s == "null" {
		return nil
	}

	t, err := time.Parse(dateLayout, s)
	if err != nil {
		return fmt.Errorf("format tanggal harus DD/MM/YYYY, contoh: 07/07/2027")
	}
	d.Time = t
	return nil
}

func (d Date) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", d.Time.Format(dateLayout))), nil
}

// Value & Scan tetap simpan ke MySQL pakai format standar (YYYY-MM-DD),
// supaya kolom DATE di database tetap valid — konversi tampilan hanya terjadi di JSON
func (d Date) Value() (driver.Value, error) {
	if d.Time.IsZero() {
		return nil, nil
	}
	return d.Time.Format("2006-01-02"), nil
}

func (d *Date) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	t, ok := value.(time.Time)
	if !ok {
		return fmt.Errorf("gagal membaca tanggal dari database")
	}
	d.Time = t
	return nil
}