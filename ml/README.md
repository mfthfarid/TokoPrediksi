# TokoPrediksi - Prediction Service (Python + FastAPI + Prophet)

Service mandiri (standalone) untuk prediksi penjualan. Belum terhubung ke Go — divalidasi sendiri dulu.

## Setup (Windows / PowerShell)

```powershell
cd prediction_service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Catatan soal instalasi Prophet di Windows:** Prophet bergantung pada `cmdstanpy`, yang butuh compiler C++ untuk build backend Stan-nya. Kalau `pip install -r requirements.txt` gagal di step Prophet, kemungkinan besar penyebabnya itu. Dua opsi:

- Install "Microsoft C++ Build Tools" dulu, lalu ulangi `pip install`.
- Atau pakai `conda install -c conda-forge prophet` (conda biasanya bawa binary yang sudah jadi, jadi nggak perlu compile).

Kalau kamu jalan di WSL2, biasanya proses install-nya lebih mulus karena toolchain Linux sudah standar.

## Menjalankan service

```powershell
uvicorn main:app --reload --port 8000
```

Service jalan di `http://localhost:8000`. Dokumentasi interaktif (Swagger UI) otomatis tersedia di `http://localhost:8000/docs` — ini juga bisa dipakai buat tes tanpa Postman.

## Tes manual

### 1. Health check

```powershell
curl http://localhost:8000/health
```

### 2. Generate data dummy

```powershell
python generate_dummy_data.py
```

Ini bikin file `dummy_request.json` (45 hari histori dengan pola akhir pekan lebih laku, minta prediksi 7 hari ke depan).

### 3. Kirim ke /predict (pakai curl)

```powershell
curl -X POST http://localhost:8000/predict `
  -H "Content-Type: application/json" `
  -d "@dummy_request.json"
```

Atau lebih gampang: buka `http://localhost:8000/docs`, expand `POST /predict`, klik "Try it out", paste isi `dummy_request.json`, klik Execute.

### 4. Cek hasilnya masuk akal

- Tanggal yang jatuh di Sabtu/Minggu harusnya punya `yhat` lebih tinggi (kalau data dummy-nya kamu generate default).
- `yhat_lower` <= `yhat` <= `yhat_upper` selalu.
- Semua angka >= 0 (sudah di-clamp di kode, penjualan nggak mungkin negatif).

## Kontrak API (sudah disepakati)

**Request** `POST /predict`

```json
{
  "product_id": 1,
  "history": [
    { "ds": "2026-06-01", "y": 15 },
    { "ds": "2026-06-02", "y": 22 }
  ],
  "periods": 7
}
```

**Response**

```json
{
  "product_id": 1,
  "predictions": [
    { "ds": "2026-07-15", "yhat": 18, "yhat_lower": 12, "yhat_upper": 24 }
  ]
}
```

## Aturan validasi yang sudah diimplementasi

| Kasus                                                  | Response                                                                                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Histori < 14 titik data                                | `400` — Prophet butuh histori cukup untuk mendeteksi pola mingguan; kurang dari itu hasilnya biasanya cuma rata-rata datar, nggak berguna |
| Ada `ds` (tanggal) duplikat                            | `400`                                                                                                                                     |
| Format tanggal salah                                   | `400`                                                                                                                                     |
| `periods` <= 0 atau > 90                               | `422` (otomatis dari Pydantic)                                                                                                            |
| `y` negatif                                            | `422` (otomatis dari Pydantic — penjualan nggak mungkin minus)                                                                            |
| `yhat`/`yhat_lower`/`yhat_upper` hasil Prophet negatif | Di-clamp ke 0 sebelum dikirim balik                                                                                                       |

## Langkah selanjutnya (setelah ini tervalidasi)

1. Bangun endpoint di Go yang agregasi `transaction_items` per produk per hari jadi bentuk `{ ds, y }` — ini kemungkinan besar butuh `GROUP BY DATE(created_at), product_id` di query SQL-nya.
2. Bangun HTTP client di Go (pakai `net/http` biasa atau library seperti `resty`) yang manggil `POST http://localhost:8000/predict`.
3. Simpan hasil `predictions` ke tabel `predictions`.
4. Baru setelah itu, pikirkan deployment: jalanin dua service (Go + Python) itu terpisah, biasanya masing-masing punya process sendiri (kalau nanti dideploy, bisa dua container Docker terpisah).
