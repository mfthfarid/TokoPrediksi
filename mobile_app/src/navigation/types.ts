import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type BottomTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  BarangTab: undefined;
  TransaksiTab: undefined;
  PrediksiTab: NavigatorScreenParams<PrediksiStackParamList>;
  PengaturanTab: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  Notifikasi: undefined;
  Kategori: undefined;
  Satuan: undefined;
  Laporan: undefined;
  Supplier: undefined;
  Pembelian: undefined;
  TambahPembelian: {
    prefillProductId?: number;
    prefillQuantity?: number;
  } | undefined;
  DetailPembelian: { id: number };
  PenyesuaianStok: undefined;
  TambahPenyesuaian: {
    productId?: number;
    productName?: string;
    tanggalKadaluwarsa?: string;
    maxQuantity?: number;
  };
  RiwayatPenyesuaian: { productId?: number };
};

export type BarangStackParamList = {
  Barang: undefined;
  TambahBarang: undefined;
  DetailBarang: { id: number };
  RiwayatHarga: { productId: number; unitId: number; unitName: string };
  RiwayatStok: { productId: number; productName: string };
};

export type TransaksiStackParamList = {
  Transaksi: undefined;
  DetailTransaksi: { id: number };
};

export type PrediksiStackParamList = {
  Prediksi: undefined;
  DetailPrediksi: { productId: number };
};

export type PengaturanStackParamList = {
  Pengaturan: undefined;
  Profil: undefined;
};
