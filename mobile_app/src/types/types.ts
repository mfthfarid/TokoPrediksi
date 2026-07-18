// mobile/types/types.ts

// ================================
// Data Types (untuk API, state, dll)
// ================================
export type Stat = {
  label: string;
  value: string;
  color: string;
};

export type Transaction = {
  item: string;
  qty: number;
  total: string;
};

export type InventoryItem = {
  id: number;
  nama: string;
  stok: number;
  harga: string;
  status: 'normal' | 'low';
};

export type Prediction = {
  barang: string;
  prediksi: string;
  urgency: 'normal' | 'high' | 'critical';
};

export type Transaksi = {
  tanggal: string;
  total: string;
  status: string;
};

export type SettingItem = {
  icon: string;
  label: string;
  rightIcon?: string;
  version?: string; // for version item
};

// ================================
// Component Types
// ================================
export interface HeaderProps {
  title: string;
  subtitle?: string;
  onNotificationPress?: () => void;
}

// Catatan: MainLayoutProps & TabNavigatorProps dihapus (2026) —
// digantikan React Navigation Bottom Tabs, lihat src/navigation/.
//
// Catatan: RootStackParamList dihapus dari sini —
// param list navigasi sekarang HANYA hidup di src/navigation/types.ts,
// supaya tidak ada dua "sumber kebenaran" untuk hal yang sama.
