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
  DashboardTab: undefined;
  BarangTab: undefined;
  TransaksiTab: undefined;
  PrediksiTab: undefined;
  PengaturanTab: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  Notifikasi: undefined;
};

export type BarangStackParamList = {
  Barang: undefined;
  TambahBarang: undefined;
  // Tambahkan di sini saat screen-nya sudah dibuat:
  // DetailBarang: { id: number };
  // EditBarang: { id: number };
};

export type TransaksiStackParamList = {
  Transaksi: undefined;
};

export type PrediksiStackParamList = {
  Prediksi: undefined;
};

export type PengaturanStackParamList = {
  Pengaturan: undefined;
};
