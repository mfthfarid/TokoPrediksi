"""
convert_excel_to_csv.py
Konversi data mentah Excel (sheet Barang + sheet per-tahun seperti 2024/2025/2026)
jadi CSV bersih (ds, product_id, y) yang siap dipakai evaluate_model.py atau
buat generate history request ke /predict.

Menangani dua masalah umum di data hasil export Excel manual:
  1. Kolom Tanggal kosong karena merged cell di Excel -> di-forward-fill.
  2. Kolom Jual berisi pecahan sebagai teks (misal "1/2") -> dikonversi ke desimal.

Cara pakai:
    python convert_excel_to_csv.py --excel data_penjualan.xlsx --sheets 2024 2025 2026

Hasil: historical_sales.csv (kolom: ds, product_id, product_name, y)
`product_id` di sini memakai Kode Barang (bukan angka), karena itu satu-satunya
pengenal unik yang konsisten antara sheet Barang dan sheet tahun.
"""
import argparse
from fractions import Fraction
import pandas as pd
import datetime
from fractions import Fraction

def parse_quantity(value, row_info="Tidak diketahui") -> float:
    """
    Fungsi super-kebal untuk membaca kolom 'Jual' dari keanehan format Excel.
    Menangani: angka biasa, pecahan teks (1/2), datetime (1/4 jadi 1-Apr), 
    dan rentetan pecahan (1/2, 1/2, 1/2).
    """
    # Jika sel kosong (NaN)
    if pd.isna(value):
        return 0.0
    
    # KASUS 1: Jika sudah berupa angka bawaan (misal: 5 atau 1.5)
    if isinstance(value, (int, float)):
        return float(value)
        
    # KASUS 2: Korban Auto-Format Excel (1/4 berubah jadi Tanggal)
    if isinstance(value, datetime.datetime):
        angka_kecil = min(value.day, value.month)
        angka_besar = max(value.day, value.month)
        return float(angka_kecil) / float(angka_besar)
        
    # KASUS 3: Jika berupa Teks (String) seperti "1/2, 1/2, 1/2" atau "1/4"
    text = str(value).strip()
    total = 0.0
    
    try:
        # Pecah teks berdasarkan koma
        parts = text.split(',')
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
                
            # Jika bentuk pecahan (ada garis miring)
            if '/' in part:
                total += float(Fraction(part))
            else:
                part = part.replace(',', '.') 
                total += float(part)
                
        return total
        
    except Exception as e:
        # Menampilkan NOMOR BARIS tempat ditemukannya data aneh
        print(f"⚠️ Peringatan: Ditemukan data aneh '{text}' di Baris Excel ke-{row_info} -> Error: {e}. Diubah menjadi 0.")
        return 0.0


def load_sheet(excel_path: str, sheet_name: str) -> pd.DataFrame:
    df = pd.read_excel(excel_path, sheet_name=sheet_name)

    # Jebakan #1: Tanggal kosong akibat merged cell -> isi dengan tanggal terakhir yang valid di atasnya
    df["Tanggal"] = df["Tanggal"].replace("", pd.NA)
    df["Tanggal"] = df["Tanggal"].ffill()

    missing_after_fill = df["Tanggal"].isna().sum()
    if missing_after_fill > 0:
        print(f"  PERINGATAN [{sheet_name}]: {missing_after_fill} baris masih tanpa tanggal setelah forward-fill "
              f"(kemungkinan baris kosong di awal sheet) -- baris ini akan dibuang.")
        df = df.dropna(subset=["Tanggal"])

    # Coba ubah string ke datetime
    df["ds"] = pd.to_datetime(df["Tanggal"], format="%d/%m/%Y", errors="coerce")
    
    # -------------------------------------------------------------------------
    # PERBAIKAN: Tangkap detail baris yang tanggalnya berubah jadi NaT (gagal)
    # -------------------------------------------------------------------------
    invalid_dates_df = df[df["ds"].isna()]
    bad_dates = len(invalid_dates_df)
    
    if bad_dates > 0:
        print(f"  ⚠️ PERINGATAN [{sheet_name}]: {bad_dates} baris punya format tanggal yang tidak terbaca.")
        
        # Looping baris yang error untuk di-print letaknya
        for index, row in invalid_dates_df.iterrows():
            # Sama seperti 'Jual', index pandas + 2 agar akurat dengan baris Excel
            excel_row = index + 2
            sumber_teks = row['Tanggal']
            print(f"      -> Cek Baris Excel ke-{excel_row} | Nilai tanggal: '{sumber_teks}'")
            
        print("      (Baris-baris tersebut dibuang dari proses)")
        
        # Setelah selesai di-print, baru buang baris errornya
        df = df.dropna(subset=["ds"])
    # -------------------------------------------------------------------------

    # Jebakan #2: kuantitas pecahan teks
    df["y"] = df.apply(lambda row: parse_quantity(row["Jual"], row_info=(row.name + 2)), axis=1)

    df = df.rename(columns={"Kode Barang": "product_id", "Nama Barang": "product_name"})
    return df[["ds", "product_id", "product_name", "y"]]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--excel", required=True, help="Path ke file Excel sumber")
    parser.add_argument("--sheets", nargs="+", required=True, help="Nama sheet tahun, misal: 2024 2025 2026")
    parser.add_argument("--output", default="historical_sales.csv")
    args = parser.parse_args()

    all_rows = []
    for sheet in args.sheets:
        print(f"Membaca sheet '{sheet}'...")
        df = load_sheet(args.excel, sheet)
        print(f"  {len(df)} baris valid, rentang tanggal: {df['ds'].min().date()} s/d {df['ds'].max().date()}")
        all_rows.append(df)

    combined = pd.concat(all_rows, ignore_index=True)

    # Gabung kalau ada produk yang sama terjual lebih dari sekali di tanggal yang sama
    grouped = (
        combined.groupby(["ds", "product_id", "product_name"], as_index=False)["y"].sum()
    )
    grouped = grouped.sort_values(["product_id", "ds"]).reset_index(drop=True)
    grouped["ds"] = grouped["ds"].dt.strftime("%Y-%m-%d")

    grouped.to_csv(args.output, index=False)

    print(f"\nTotal baris gabungan: {len(grouped)}")
    print(f"Jumlah produk unik  : {grouped['product_id'].nunique()}")
    print(f"Disimpan ke: {args.output}")
    print("\nContoh isi:")
    print(grouped.head(10).to_string(index=False))


if __name__ == "__main__":
    main()