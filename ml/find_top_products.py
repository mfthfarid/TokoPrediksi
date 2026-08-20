import pandas as pd

# 1. Baca data historical_sales.csv
df = pd.read_csv("historical_sales.csv")

# Ensure kolom product_name ada (jika tidak, pakai product_id saja)
group_cols = ["product_id"]
if "product_name" in df.columns:
    group_cols.append("product_name")

# 2. Hitung statistik per produk
summary = df.groupby(group_cols).agg(
    jumlah_hari_transaksi=("ds", "nunique"),  # Kerapatan hari (makin tinggi makin bagus untuk Prophet)
    total_unit_terjual=("y", "sum"),          # Volume penjualan total
    rata2_per_transaksi=("y", "mean")
).reset_index()

# 3. Urutkan berdasarkan jumlah hari transaksi terbanyak, lalu total unit terbanyak
summary_sorted = summary.sort_values(
    by=["jumlah_hari_transaksi", "total_unit_terjual"], 
    ascending=[False, False]
)

print("\n=== TOP 15 PRODUK DENGAN DATA PENJUALAN PALING CONSISTENT/PADAT ===")
print(summary_sorted.head(15).to_string(index=False))

# Simpan ke CSV agar bisa dibaca di Excel jika perlu
summary_sorted.to_csv("ringkasan_produk_terlaris.csv", index=False)
print("\nRingkasan lengkap disimpan ke 'ringkasan_produk_terlaris.csv'")