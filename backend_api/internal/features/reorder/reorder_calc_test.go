package reorder

import (
	"math"
	"testing"
)

func approx(a, b float64) bool { return math.Abs(a-b) < 1e-6 }

func TestCalcROP(t *testing.T) {
	cases := []struct {
		name   string
		demand []float64
		t      float64
		want   float64
	}{
		{"T positif", []float64{100, 120, 110}, 40, 370},
		{"T negatif", []float64{100, 120, 110}, -40, 290},
		{"dipotong di nol", []float64{10, 10, 10}, -100, 0},
	}
	for _, c := range cases {
		if got := CalcROP(c.demand, c.t); !approx(got, c.want) {
			t.Errorf("%s: got %v, want %v", c.name, got, c.want)
		}
	}
}

func TestEffectiveTPolicy(t *testing.T) {
	if got := EffectiveT(-40); got != 0 {
		t.Errorf("EffectiveT(-40) = %v, want 0", got)
	}
	if got := CalcROP([]float64{100, 120, 110}, EffectiveT(-40)); !approx(got, 330) {
		t.Errorf("ROP dengan T dibatasi = %v, want 330", got)
	}
}

func TestCalcRecommendedPurchase(t *testing.T) {
	if got := CalcRecommendedPurchase([]float64{1230}, 40, 320); !approx(got, 950) {
		t.Errorf("got %v, want 950", got)
	}
	if got := CalcRecommendedPurchase([]float64{100}, 0, 500); got != 0 {
		t.Errorf("stok berlebih harus 0, got %v", got)
	}
}

func TestQuantile(t *testing.T) {
	if got := Quantile([]float64{5, 1, 4, 2, 3}, 0.95); !approx(got, 4.8) {
		t.Errorf("got %v, want 4.8", got)
	}
}

func TestStatusFor(t *testing.T) {
	if got := StatusFor(300, 370, 100); got != "below_rop" {
		t.Errorf("got %v", got)
	}
	if got := StatusFor(450, 370, 100); got != "near" {
		t.Errorf("got %v", got)
	}
	if got := StatusFor(700, 370, 100); got != "safe" {
		t.Errorf("got %v", got)
	}
}