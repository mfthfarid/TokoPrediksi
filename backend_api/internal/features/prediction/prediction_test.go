package prediction

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/customtype"
)

func TestChartDataSerialization(t *testing.T) {
	lower := 5.0
	upper := 15.0

	cd := ChartData{
		Actual: []ChartPoint{
			{Date: "01/07/2026", Quantity: 10},
		},
		Predicted: []ChartPredictedPoint{
			{Date: "08/07/2026", Quantity: 12, Lower: &lower, Upper: &upper},
		},
		PreviousPredicted: []ChartPredictedPoint{
			{Date: "01/07/2026", Quantity: 9, Lower: &lower, Upper: &upper},
		},
	}

	bytes, err := json.Marshal(cd)
	if err != nil {
		t.Fatalf("json.Marshal failed: %v", err)
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(bytes, &parsed); err != nil {
		t.Fatalf("json.Unmarshal failed: %v", err)
	}

	if _, ok := parsed["previous_predicted"]; !ok {
		t.Errorf("expected 'previous_predicted' field in JSON output")
	}

	prevArr, ok := parsed["previous_predicted"].([]interface{})
	if !ok || len(prevArr) != 1 {
		t.Errorf("expected 1 element in previous_predicted, got %v", prevArr)
	}

	firstPrev := prevArr[0].(map[string]interface{})
	if firstPrev["date"] != "01/07/2026" {
		t.Errorf("expected date '01/07/2026', got %v", firstPrev["date"])
	}
	if firstPrev["quantity"] != 9.0 {
		t.Errorf("expected quantity 9.0, got %v", firstPrev["quantity"])
	}
}

func TestDetermineDisplayUnitAndDivisor(t *testing.T) {
	// Gram < 1000 stays Gram
	div, unit := DetermineDisplayUnit("Gram", 500)
	if div != 1 || unit != "Gram" {
		t.Errorf("expected (1, Gram), got (%v, %v)", div, unit)
	}

	// Gram >= 1000 converts to Kg with divisor 1000
	div, unit = DetermineDisplayUnit("gram", 15000)
	if div != 1000 || unit != "Kg" {
		t.Errorf("expected (1000, Kg), got (%v, %v)", div, unit)
	}

	// Verify conversion math
	rawQuantity := 15000.0
	converted := round2(rawQuantity / div)
	if converted != 15.0 {
		t.Errorf("expected 15.0, got %v", converted)
	}
}

func TestPredictionModel(t *testing.T) {
	date, _ := time.Parse("2006-01-02", "2026-07-01")
	pred := Prediction{
		RunID:             "test-run-123",
		ProductID:         1,
		PredictionDate:    customtype.Date{Time: date},
		PredictedQuantity: 10.5,
	}

	if pred.RunID != "test-run-123" {
		t.Errorf("unexpected runID: %s", pred.RunID)
	}
}
