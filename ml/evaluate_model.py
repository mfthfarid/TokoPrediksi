"""
evaluate_model.py
Evaluasi akurasi model Prophet pakai cross-validation bawaan (bukan cuma
"kelihatan masuk akal" secara visual). Hasilnya: MAE, RMSE, MAPE per horizon
prediksi -- angka yang bisa langsung dipakai di bab hasil skripsi.

Cara pakai:
    python evaluate_model.py --csv historical_sales.csv
    python evaluate_model.py --csv historical_sales.csv --product-id 1

Format CSV yang diharapkan minimal punya kolom:
    ds  -> tanggal (YYYY-MM-DD)
    y   -> jumlah unit terjual (base unit) pada tanggal itu
Kolom `product_id` opsional -- kalau ada dan kamu isi --product-id, skrip
otomatis filter ke produk itu saja.
"""
import argparse

import pandas as pd
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics


def load_data(csv_path: str, product_id: str | None = None) -> pd.DataFrame:
    df = pd.read_csv(csv_path)

    if product_id is not None:
        if "product_id" not in df.columns:
            raise ValueError("CSV tidak punya kolom 'product_id', tapi --product-id diisi.")
        df = df[df["product_id"] == product_id]

    if df.empty:
        raise ValueError("Tidak ada baris data setelah difilter. Cek product_id atau isi CSV.")

    df["ds"] = pd.to_datetime(df["ds"])
    # Gabungkan kalau ada beberapa baris transaksi di tanggal yang sama
    df = df.groupby("ds", as_index=False)["y"].sum()
    df = df.sort_values("ds").reset_index(drop=True)
    return df


def describe_gaps(df: pd.DataFrame) -> None:
    """Tampilkan ringkasan rentang tanggal & seberapa besar data yang benar-benar hilang."""
    full_range = pd.date_range(df["ds"].min(), df["ds"].max(), freq="D")
    missing_days = full_range.difference(df["ds"])
    total_days = len(full_range)
    print(f"Rentang kalender total : {df['ds'].min().date()} s/d {df['ds'].max().date()} ({total_days} hari)")
    print(f"Hari dengan data       : {len(df)}")
    print(f"Hari TANPA data        : {len(missing_days)} ({len(missing_days) / total_days:.1%} dari rentang)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="Path ke file CSV historis (kolom ds, y)")
    parser.add_argument("--product-id", type=str, default=None)
    parser.add_argument(
        "--initial",
        default="180 days",
        help="Panjang window training awal sebelum cutoff pertama. "
        "PENTING: sesuaikan supaya cutoff pertama sudah lewat dari blok data yang kontinu, "
        "bukan jatuh di tengah gap -- lihat output describe_gaps di atas dulu.",
    )
    parser.add_argument("--period", default="30 days", help="Jarak antar titik evaluasi (cutoff)")
    parser.add_argument(
        "--horizon", default="7 days", help="Horizon prediksi yang dievaluasi (samakan dengan 'periods' di kontrak API)"
    )
    args = parser.parse_args()

    df = load_data(args.csv, args.product_id)
    describe_gaps(df)

    if len(df) < 30:
        print("\nPERINGATAN: data kurang dari 30 titik -- hasil cross-validation kemungkinan tidak stabil.")

    print("\nMelatih model awal...")
    model = Prophet()
    model.fit(df)

    print(f"Menjalankan cross-validation (initial={args.initial}, period={args.period}, horizon={args.horizon})...")
    df_cv = cross_validation(
        model,
        initial=args.initial,
        period=args.period,
        horizon=args.horizon,
    )

    if df_cv.empty:
        print(
            "\nTIDAK ADA fold evaluasi yang dihasilkan. Ini biasanya karena --initial terlalu "
            "besar/kecil relatif terhadap rentang data kamu, atau seluruh horizon jatuh di zona gap "
            "tanpa data asli untuk dibandingkan. Coba kecilkan --initial atau --period."
        )
        return

    df_metrics = performance_metrics(df_cv)
    print(f"\nJumlah fold evaluasi berhasil: {df_cv['cutoff'].nunique()}")
    print("\n=== Ringkasan metrik per horizon ===")
    print(df_metrics[["horizon", "mae", "rmse", "mape"]].to_string(index=False))

    df_metrics.to_csv("cv_metrics_output.csv", index=False)
    df_cv.to_csv("cv_raw_output.csv", index=False)
    print("\nDetail disimpan ke cv_metrics_output.csv (ringkasan) dan cv_raw_output.csv (per titik).")
    print("Kedua file ini bisa langsung jadi lampiran/tabel di bab hasil skripsi.")


if __name__ == "__main__":
    main()