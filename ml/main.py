import hashlib
import json
from pathlib import Path
from typing import List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from prophet import Prophet
from pydantic import BaseModel, Field

app = FastAPI(title="TokoPrediksi - Prediction Service", version="1.0.0")

# Prophet butuh histori yang cukup biar hasilnya akurat.
# 14 hari adalah batas bawah wajar untuk seasonality mingguan.
MIN_HISTORY_POINTS = 14
CONFIG_PATH = Path(__file__).parent / "model_config.json"


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        return {
            "defaults": {
                "cps": 0.05,
                "sps": 10.0,
                "mode": "additive",
                "hps": 10.0,
            },
            "holidays": [],
            "products": {},
        }
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


CONFIG = load_config()


def get_config_hash() -> str:
    if not CONFIG_PATH.exists():
        return "prophet-v4-default"
    with open(CONFIG_PATH, "rb") as f:
        return f"prophet-v4-{hashlib.sha256(f.read()).hexdigest()[:8]}"


MODEL_VERSION = get_config_hash()


def get_product_params(product_id: int):
    defaults = CONFIG.get("defaults", {})
    products = CONFIG.get("products", {})
    p_config = products.get(str(product_id), {})

    cps = float(p_config.get("cps", defaults.get("cps", 0.05)))
    sps = float(p_config.get("sps", defaults.get("sps", 10.0)))
    hps = float(p_config.get("hps", defaults.get("hps", 10.0)))
    mode = str(p_config.get("mode", defaults.get("mode", "additive")))
    return cps, sps, hps, mode


def get_holidays_df() -> Optional[pd.DataFrame]:
    holidays = CONFIG.get("holidays", [])
    if not holidays:
        return None
    df = pd.DataFrame(holidays)
    df["ds"] = pd.to_datetime(df["ds"])
    return df


class HistoryPoint(BaseModel):
    ds: str  # tanggal, format YYYY-MM-DD
    y: float = Field(ge=0, description="Jumlah unit terjual pada tanggal ds")


class PredictRequest(BaseModel):
    product_id: int
    history: List[HistoryPoint]
    periods: int = Field(gt=0, le=90, description="Berapa hari ke depan yang diprediksi")


class PredictionPoint(BaseModel):
    ds: str
    yhat: float
    yhat_lower: float
    yhat_upper: float


class PredictResponse(BaseModel):
    product_id: int
    predictions: List[PredictionPoint]
    model_version: Optional[str] = None


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_version": MODEL_VERSION,
        "configured_products": list(CONFIG.get("products", {}).keys()),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if len(req.history) < MIN_HISTORY_POINTS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Minimal {MIN_HISTORY_POINTS} titik data historis diperlukan, "
                f"hanya diterima {len(req.history)}"
            ),
        )

    df = pd.DataFrame([{"ds": h.ds, "y": h.y} for h in req.history])

    try:
        df["ds"] = pd.to_datetime(df["ds"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Format tanggal tidak valid: {e}")

    df = df.sort_values("ds").reset_index(drop=True)

    if df["ds"].duplicated().any():
        raise HTTPException(status_code=400, detail="Ada tanggal (ds) yang duplikat di data historis")

    cps, sps, hps, mode = get_product_params(req.product_id)
    holidays_df = get_holidays_df()

    model = Prophet(
        changepoint_prior_scale=cps,
        seasonality_prior_scale=sps,
        holidays_prior_scale=hps,
        seasonality_mode=mode,
        holidays=holidays_df,
    )
    model.fit(df)

    future = model.make_future_dataframe(periods=req.periods)
    forecast = model.predict(future)

    # Ambil cuma baris untuk periode ke depan (bukan fit historisnya)
    forecast_future = forecast.tail(req.periods)

    predictions = [
        PredictionPoint(
            ds=row["ds"].strftime("%Y-%m-%d"),
            # Penjualan tidak mungkin negatif; clamp ke 0 agar aman dikonsumsi backend
            yhat=round(max(0.0, float(row["yhat"])), 2),
            yhat_lower=round(max(0.0, float(row["yhat_lower"])), 2),
            yhat_upper=round(max(0.0, float(row["yhat_upper"])), 2),
        )
        for _, row in forecast_future.iterrows()
    ]

    return PredictResponse(
        product_id=req.product_id,
        predictions=predictions,
        model_version=MODEL_VERSION,
    )