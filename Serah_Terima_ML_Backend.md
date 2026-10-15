# Serah Terima Hasil Colab ke Projek Utama (ML, Backend, Frontend)

## Cara pakai

- Tempel dokumen ini ke **chat ML** (folder `ml/`, Python) dan **chat Backend** (Go).
- **Chat Frontend** tidak menerima dokumen ini langsung. Seperti biasa, chat Backend yang membuat daftar perubahan API/field untuk chat Frontend (bahan usulannya ada di bagian 4).
- Sumber kebenaran angka evaluasi untuk laporan adalah **notebook Colab** (`Prophet_Toko_XYZ_Final_v4.ipynb`). Skrip evaluasi di projek utama tidak dipakai untuk angka laporan.
- Kode referensi layanan ML ada di folder `ml_service/` (contoh yang sudah diuji, bukan pengganti kode `ml/` yang sudah ada).

## 1. Keputusan dari Colab

**Parameter model final per produk** (file `model_config.json`, holiday selalu aktif):

| product_id | Produk | cps | sps | mode | hps |
|---|---|---|---|---|---|
| 13 | Beras | 0.01 | 0.1 | additive | 1.0 |
| 129 | Kopi Hitam | 0.5 | 0.1 | additive | 0.1 |
| 158 | Mie Goreng | 0.5 | 0.1 | additive | 1.0 |
| 259 | Telur | 0.01 | 1.0 | multiplicative | 10.0 |
| 292 | Yupi 500 | 0.05 | 0.1 | multiplicative | 1.0 |

Nama parameter Prophet: cps = `changepoint_prior_scale`, sps = `seasonality_prior_scale`, hps = `holidays_prior_scale`, mode = `seasonality_mode`.

**Hari libur:** Idul Fitri jendela −4..+3, Idul Adha jendela −2..+2, tanggal 2024–2026 (lihat `model_config.json`). Tanggal tahun berikutnya harus ditambahkan setiap tahun.

**Pengaturan evaluasi (informasi):** cross-validation initial 370 hari, period 14 hari, horizon 30 hari. Walk-forward: latih ulang tiap 7 hari, prediksi 14 hari.

**Reorder point (ROP):** lead time 3 hari (default; nilai sebenarnya dari supplier), service level 95% (**contoh, belum final**), aturan C (kuantil empiris).

## 2. Untuk chat ML (Python, folder `ml/`)

1. Pakai `model_config.json` dari Colab sebagai **satu-satunya sumber** hari libur dan parameter per produk.
2. Teruskan **empat** parameter ke Prophet: `changepoint_prior_scale`, `seasonality_prior_scale`, **`holidays_prior_scale`**, `seasonality_mode`, ditambah daftar hari libur. Versi lama yang belum meneruskan `holidays_prior_scale` akan menghasilkan angka berbeda dari Colab.
3. Produk yang tidak ada di konfigurasi memakai `defaults`.
4. Kontrak `/predict` tetap. Boleh menambah field `model_version` (hash konfigurasi) pada respons. Klien Go yang lama aman mengabaikannya.
5. Syarat tetap: riwayat minimal 14 hari, nilai prediksi negatif dipotong ke 0.
6. Pembulatan satuan pcs **tidak dilakukan di Python**, tetapi di aplikasi.
7. Skrip evaluasi lama (`evaluate_model.py`) jangan dipakai untuk angka laporan. Jika dipertahankan, samakan pengaturan CV dengan Colab.
8. Referensi uji: `ml_service/test_service.py` (6 tes, termasuk pengecekan `hps` terteruskan).

## 3. Untuk chat Backend (Go)

**A. Lead time per produk.** Ambil dari kolom lead time di tabel supplier (tulis nama kolom sebenarnya di backend). Skema yang saya ketahui tidak memuat hubungan langsung produk ke supplier, sehingga perlu aturan pemetaan (misalnya supplier pada pembelian terakhir produk itu). Jika tidak ada, pakai default 3 hari.

**B. Kebutuhan selama lead time (D_L).** Jumlah `predicted_quantity` untuk L hari ke depan dari hasil prediksi terbaru, dalam satuan dasar (gram/pcs/ml).

**C. Nilai tambahan (T)** = kuantil 95% dari error `aktual − prediksi` pada total L hari (negatif berarti prediksi kelebihan).
- Nilai awal (seed) dari Colab, valid hanya untuk **L = 3 hari dan service level 95%**:

| Produk | T awal |
|---|---|
| Beras | 27.680,4 gram |
| Kopi Hitam | 202,6 pcs |
| Mie Goreng | 190,0 pcs |
| Telur | 29.189,2 gram |
| Yupi 500 | 149,2 pcs |

- Setelah ada riwayat, hitung ulang berkala dari tabel `predictions` dibandingkan penjualan nyata (UNION `transaction_items` dan `historical_sales`). Syarat: **hasil prediksi disimpan per run**, jangan ditimpa, dan `created_at` menjadi tanda kapan prediksi dibuat.
- Jendela yang dipakai di Colab: total L hari yang dimulai dari hari ke-1 sampai ke-7 sejak prediksi dibuat (karena prediksi diperbarui mingguan).
- Jika lead time atau service level diubah, T harus dihitung ulang. Seed tidak berlaku lagi.

**D. Rumus.** `ROP = max(0, D_L + T)`. Safety stock untuk tampilan = `T`. Jika stok produk `≤ ROP`, buat notifikasi dan tampilkan tombol rekomendasi pembelian.

**E. Satuan.** Semua perhitungan dalam satuan dasar. Konversi hanya untuk tampilan.

**F. Uji bersama Python dan Go.** Fungsi `ROP = max(0, jumlah prediksi harian + T)`:

| Prediksi harian | T | ROP |
|---|---|---|
| [100, 120, 110] | 40 | 370 |
| [100, 120, 110] | −40 | 290 |
| [10, 10, 10] | −100 | 0 |

**G.** Minta chat ini membuat **daftar perubahan untuk chat Frontend**, seperti biasa.

## 4. Usulan field untuk Frontend (bahan untuk chat Backend, bukan keputusan)

Per produk: `stock`, `rop`, `safety_stock`, `demand_lead_time` (D_L), `lead_time_days`, `service_level`, `status` (misalnya aman / mendekati / di bawah ROP, definisi ditentukan backend), `rekomendasi_tersedia`. Untuk grafik prediksi: `yhat`, `yhat_lower`, `yhat_upper` per tanggal.

## 5. Keputusan yang masih terbuka

1. Service level final (95% hanya contoh).
2. Aturan pemetaan produk ke supplier.
3. Jumlah pembelian yang direkomendasikan. Belum ada di notebook. Salah satu opsi: kebutuhan prediksi sampai pesanan berikutnya + T − stok saat ini, tetapi itu keputusan rancangan.
4. Kebijakan jika T negatif (notebook hanya memotong ROP di nol).
5. Frekuensi hitung ulang T dan jumlah minimal riwayat sebelum menggantikan seed.

## 6. Keterbatasan yang perlu dicatat

- Akurasi harian rendah (banyak hari tanpa penjualan di 2026). Pada total 14 hari, prediksi cenderung lebih tinggi dari penjualan nyata.
- Yupi 500 yang terlemah. Prophet tidak terbukti lebih baik daripada rata-rata 28 hari sebagai pembanding sederhana.
- Nilai T awal dikalibrasi pada data yang sama dengan evaluasinya (contoh perhitungan, bukan bukti kinerja di data baru).
- Interval `yhat_lower`/`yhat_upper` tidak dievaluasi di Colab.
