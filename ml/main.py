from typing import List

import pandas as pd
from fastapi import FastAPI, HTTPException
from prophet import Prophet
from pydantic import BaseModel, Field

app = FastAPI(title="TokoPrediksi - Prediction Service", version="1.0.0")

# Prophet butuh histori yang cukup biar hasilnya nggak asal-asalan.
# 14 hari itu batas bawah "wajar" untuk seasonality mingguan; makin sedikit,
# makin sering hasilnya cuma garis lurus/rata-rata.
MIN_HISTORY_POINTS = 14


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


@app.get("/health")
def health():
    return {"status": "ok"}


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

    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=req.periods)
    forecast = model.predict(future)

    # Ambil cuma baris untuk periode ke depan (bukan fit historisnya)
    forecast_future = forecast.tail(req.periods)

    predictions = [
        PredictionPoint(
            ds=row["ds"].strftime("%Y-%m-%d"),
            # Penjualan nggak mungkin negatif, tapi Prophet bisa aja
            # memprediksi angka negatif untuk produk yang jarang laku.
            # Di-clamp ke 0 di sini biar konsumen API (Go) nggak perlu
            # mikirin ini lagi.
            yhat=round(max(0.0, row["yhat"]), 2),
            yhat_lower=round(max(0.0, row["yhat_lower"]), 2),
            yhat_upper=round(max(0.0, row["yhat_upper"]), 2),
        )
        for _, row in forecast_future.iterrows()
    ]

    return PredictResponse(product_id=req.product_id, predictions=predictions)