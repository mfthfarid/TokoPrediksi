// mobile/utils/constants.ts
import {
  Stat,
  Transaction,
  InventoryItem,
  Prediction,
  Transaksi,
} from '../types/types';

export const STATS: Stat[] = [
  { label: 'Penjualan', value: 'Rp 2.450.000', color: '#4CAF50' },
  { label: 'Transaksi', value: '24', color: '#2196F3' },
  { label: 'Stok Rendah', value: '5', color: '#FF9800' },
];

export const TRANSACTIONS: Transaction[] = [
  { item: 'Mie Instan', qty: 5, total: 'Rp 40.000' },
  { item: 'Gula Pasir', qty: 2, total: 'Rp 45.000' },
  { item: 'Telur Ayam', qty: 1, total: 'Rp 32.000' },
];

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 1, nama: 'Mie Instan', stok: 150, harga: 'Rp 8.000', hargaAngka: 8000, kategori: 'Makanan', photoThumbnailUrl: null, status: 'normal' },
  { id: 2, nama: 'Gula Pasir 1kg', stok: 12, harga: 'Rp 22.500', hargaAngka: 22500, kategori: 'Bahan Pokok', photoThumbnailUrl: null, status: 'low' },
  { id: 3, nama: 'Telur Ayam', stok: 45, harga: 'Rp 32.000', hargaAngka: 32000, kategori: 'Bahan Pokok', photoThumbnailUrl: null, status: 'normal' },
  { id: 4, nama: 'Minyak Goreng 2L', stok: 3, harga: 'Rp 48.000', hargaAngka: 48000, kategori: 'Bahan Pokok', photoThumbnailUrl: null, status: 'low' },
  { id: 5, nama: 'Beras Premium', stok: 200, harga: 'Rp 15.000', hargaAngka: 15000, kategori: 'Bahan Pokok', photoThumbnailUrl: null, status: 'normal' },
];

export const PREDICTIONS: Prediction[] = [
  { barang: 'Mie Instan', prediksi: '7 hari', urgency: 'high' },
  { barang: 'Gula Pasir 1kg', prediksi: '3 hari', urgency: 'critical' },
  { barang: 'Minyak Goreng 2L', prediksi: '5 hari', urgency: 'high' },
  { barang: 'Telur Ayam', prediksi: '12 hari', urgency: 'normal' },
];

export const TRANSAKSI_LIST: Transaksi[] = [
  { tanggal: '24 Nov 2024, 14:30', total: 'Rp 120.000', status: 'Selesai' },
  { tanggal: '24 Nov 2024, 13:15', total: 'Rp 87.500', status: 'Selesai' },
  { tanggal: '24 Nov 2024, 11:45', total: 'Rp 156.000', status: 'Selesai' },
  { tanggal: '23 Nov 2024, 16:20', total: 'Rp 92.000', status: 'Selesai' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'inventory', label: 'Inventory', icon: 'package-multiple' },
  { id: 'transaksi', label: 'Transaksi', icon: 'receipt' },
  { id: 'prediksi', label: 'Prediksi', icon: 'brain' },
  { id: 'pengaturan', label: 'Pengaturan', icon: 'cog' },
];
