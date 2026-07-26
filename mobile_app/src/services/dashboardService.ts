import api from './api';

export interface LowStockProductApi {
  id: number;
  name: string;
  stock: number; // angka murni, BUKAN string kayak dugaan awal saya
}

export interface TopSellingProductApi {
  id: number;
  name: string;
  qty: number; // asumsi - di data contoh kamu masih null, belum ketahuan bentuknya
}

export interface DashboardSummaryApi {
  total_sales_today: number;
  total_transactions_today: number;
  total_profit_today: number;
  profit_margin_today: number; // persen, mis. 16.8
  low_stock_count: number;
  low_stock_products: LowStockProductApi[];
  top_selling_products: TopSellingProductApi[] | null; // BISA null
  predicted_stockout_count: number;
}

export const getDashboardSummary = () =>
  api.get<DashboardSummaryApi>('/api/dashboard/summary');
