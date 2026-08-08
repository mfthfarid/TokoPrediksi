package customtype

import (
	"database/sql/driver"
	"fmt"
	"time"
)

const dateTimeLayout = "02/01/2006 15:04"
const dbDateTimeLayout = "2006-01-02 15:04:05"

// DateTime pembungkus time.Time yang JSON-nya format "DD/MM/YYYY HH:mm",
// beda dengan Date yang cuma simpan tanggal tanpa jam.
type DateTime struct {
	time.Time
}

func (d *DateTime) UnmarshalJSON(b []byte) error {
	s := string(b)
	if len(s) >= 2 {
		s = s[1 : len(s)-1]
	}
	if s == "" || s == "null" {
		return nil
	}

	t, err := time.Parse(dateTimeLayout, s)
	if err != nil {
		return fmt.Errorf("format tanggal harus DD/MM/YYYY HH:mm, contoh: 31/07/2026 14:30")
	}
	d.Time = t
	return nil
}

func (d DateTime) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", d.Time.Format(dateTimeLayout))), nil
}

// Value simpan waktu LENGKAP (bukan cuma tanggal) ke kolom DATETIME
func (d DateTime) Value() (driver.Value, error) {
	if d.Time.IsZero() {
		return nil, nil
	}
	return d.Time.Format(dbDateTimeLayout), nil
}

func (d *DateTime) Scan(value interface{}) error {
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