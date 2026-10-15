import unittest
from datetime import datetime, timedelta

from main import (
    app,
    CONFIG,
    MODEL_VERSION,
    PredictRequest,
    HistoryPoint,
    health,
    predict,
    get_product_params,
    get_holidays_df,
)


class TestMLService(unittest.TestCase):

    def test_config_loaded(self):
        self.assertIn("products", CONFIG)
        self.assertIn("13", CONFIG["products"])
        self.assertIn("129", CONFIG["products"])
        self.assertIn("158", CONFIG["products"])
        self.assertIn("259", CONFIG["products"])
        self.assertIn("292", CONFIG["products"])

    def test_product_params(self):
        # Product 13 (Beras): cps=0.01, sps=0.1, hps=1.0, mode="additive"
        cps, sps, hps, mode = get_product_params(13)
        self.assertEqual(cps, 0.01)
        self.assertEqual(sps, 0.1)
        self.assertEqual(hps, 1.0)
        self.assertEqual(mode, "additive")

        # Product 259 (Telur): cps=0.01, sps=1.0, hps=10.0, mode="multiplicative"
        cps, sps, hps, mode = get_product_params(259)
        self.assertEqual(cps, 0.01)
        self.assertEqual(sps, 1.0)
        self.assertEqual(hps, 10.0)
        self.assertEqual(mode, "multiplicative")

        # Unconfigured product: uses defaults
        cps, sps, hps, mode = get_product_params(9999)
        self.assertEqual(cps, 0.05)
        self.assertEqual(sps, 10.0)
        self.assertEqual(hps, 10.0)
        self.assertEqual(mode, "additive")

    def test_holidays_df(self):
        df = get_holidays_df()
        self.assertIsNotNone(df)
        self.assertGreater(len(df), 0)
        self.assertIn("holiday", df.columns)
        self.assertIn("ds", df.columns)
        self.assertIn("lower_window", df.columns)
        self.assertIn("upper_window", df.columns)

    def test_health_endpoint(self):
        data = health()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["model_version"], MODEL_VERSION)
        self.assertIn("158", data["configured_products"])

    def test_predict_endpoint(self):
        base_date = datetime(2024, 1, 1)
        history = [
            HistoryPoint(ds=(base_date + timedelta(days=i)).strftime("%Y-%m-%d"), y=float(10 + (i % 5)))
            for i in range(20)
        ]

        req = PredictRequest(
            product_id=158,  # Mie Goreng
            history=history,
            periods=7,
        )

        resp = predict(req)

        self.assertEqual(resp.product_id, 158)
        self.assertEqual(len(resp.predictions), 7)
        self.assertEqual(resp.model_version, MODEL_VERSION)

        for p in resp.predictions:
            self.assertGreaterEqual(p.yhat, 0.0)
            self.assertGreaterEqual(p.yhat_lower, 0.0)
            self.assertGreaterEqual(p.yhat_upper, 0.0)


if __name__ == "__main__":
    unittest.main()
