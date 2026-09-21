"""
top_products.py
Lihat produk terlaris dari hasil export MySQL (kolom: product_id, sale_date,
quantity_sold, price_sold), buat bantu milih 5 produk unggulan berbasis data,
bukan tebakan.

Tiga metrik yang ditampilkan per produk:
- total_quantity : total unit terjual sepanjang data (paling relevan buat
  Prophet, karena ini yang diprediksi)
- total_revenue  : total omzet (asumsi price_sold = total harga per baris,
  bukan harga per unit -- cek dulu sebelum percaya angka ini, lihat catatan di bawah)
- active_days    : berapa hari produk ini benar-benar tercatat laku. Ini
  penting buat prediksi time series: produk dengan active_days tinggi
  (sering laku) jauh lebih layak diprediksi Prophet dibanding produk yang
  jarang laku, meski total_quantity-nya kebetulan tinggi (misal karena beli
  banyak sekali lalu hilang berbulan-bulan).

Cara pakai:
    python top_products.py --csv export_predictions.csv --top 15
"""
import argparse

import pandas as pd


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="Path ke hasil export MySQL")
    parser.add_argument("--top", type=int, default=15, help="Berapa produk teratas yang ditampilkan")
    parser.add_argument(
        "--sort-by",
        choices=["total_quantity", "total_revenue", "active_days"],
        default="total_quantity",
        help="Urutkan berdasarkan metrik apa",
    )
    args = parser.parse_args()

    df = pd.read_csv(args.csv)
    df["sale_date"] = pd.to_datetime(df["sale_date"])

    total_days_in_data = (df["sale_date"].max() - df["sale_date"].min()).days + 1

    summary = df.groupby("product_id").agg(
        total_quantity=("quantity_sold", "sum"),
        total_revenue=("price_sold", "sum"),
        active_days=("sale_date", "nunique"),
    ).reset_index()

    summary["pct_hari_aktif"] = (summary["active_days"] / total_days_in_data * 100).round(1)
    summary = summary.sort_values(args.sort_by, ascending=False)

    print(f"Rentang data       : {df['sale_date'].min().date()} s/d {df['sale_date'].max().date()} "
          f"({total_days_in_data} hari kalender)")
    print(f"Jumlah produk unik : {summary.shape[0]}")
    print(f"\n=== Top {args.top} produk (urut berdasarkan {args.sort_by}) ===\n")
    print(
        summary.head(args.top).to_string(
            index=False,
            formatters={
                "total_quantity": "{:,.0f}".format,
                "total_revenue": "Rp{:,.0f}".format,
                "pct_hari_aktif": "{:.1f}%".format,
            },
        )
    )

    print(
        "\nCatatan: total_revenue di sini menjumlahkan kolom price_sold apa adanya. "
        "Cek dulu ke skema tabelmu apakah price_sold itu SUDAH total per baris "
        "(quantity x harga satuan) atau harga satuan saja -- kalau ternyata harga "
        "satuan, angka total_revenue di atas keliru dan perlu dikalikan quantity_sold dulu."
    )
    print(
        "\nSaran pemilihan 5 produk unggulan: prioritaskan pct_hari_aktif TINGGI, "
        "bukan cuma total_quantity tinggi -- produk yang konsisten laku tiap hari "
        "jauh lebih cocok untuk Prophet dibanding produk yang sesekali diborong lalu sepi lama."
    )


if __name__ == "__main__":
    main()