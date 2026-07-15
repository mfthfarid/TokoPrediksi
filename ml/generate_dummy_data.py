"""
Generate data dummy penjualan buat tes manual ke /predict.
Simulasi: tren naik pelan + lonjakan di akhir pekan + noise acak.

Cara pakai:
    python generate_dummy_data.py
Hasilnya: dummy_request.json (siap di-paste ke Postman / curl)
"""
import json
import random
from datetime import date, timedelta

random.seed(42)

start = date(2026, 6, 1)
NUM_DAYS = 45  # minimal 14, tapi makin banyak makin bagus buat Prophet belajar pola

history = []
for i in range(NUM_DAYS):
    d = start + timedelta(days=i)
    base = 15
    trend = i * 0.15
    weekend_boost = 8 if d.weekday() in (5, 6) else 0  # Sabtu=5, Minggu=6
    noise = random.randint(-3, 3)
    y = max(0, base + trend + weekend_boost + noise)
    history.append({"ds": d.isoformat(), "y": y})

payload = {"product_id": 1, "history": history, "periods": 7}

with open("dummy_request.json", "w") as f:
    json.dump(payload, f, indent=2)

print(f"Dibuat: dummy_request.json ({NUM_DAYS} hari histori, prediksi 7 hari ke depan)")