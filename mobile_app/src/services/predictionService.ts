import api from './api';

export type UrgencyLevel = 'tinggi' | 'sedang' | 'rendah';

export interface PredictionSummaryApi {
  product_id: number;
  product_name: string;
  current_stock: number;
  average_daily_sales: number;
  days_remaining: number | null;
  urgency: UrgencyLevel;
  has_prediction: boolean;
  display_unit?: string;
  current_stock_display?: string;
  average_daily_sales_display?: string;
}

export const getPredictionSummary = () =>
  api.get<PredictionSummaryApi[]>('/api/predictions/summary');

export interface ChartPoint {
  date: string; // DD/MM/YYYY
  quantity: number;
  lower?: number;
  upper?: number;
}

export interface PredictionRecordApi {
  id: number;
  product_id: number;
  prediction_date: string;
  predicted_quantity: number;
  yhat_lower: number;
  yhat_upper: number;
  model_version: string;
}

export interface PredictionDetailApi {
  product_id: number;
  product_name: string;
  has_prediction: boolean;
  current_stock: number;
  average_daily_sales: number;
  days_remaining: number | null;
  urgency: UrgencyLevel;
  recommended_restock_quantity: number;
  chart_data: {
    actual: ChartPoint[];
    predicted: ChartPoint[];
  };
  predictions: PredictionRecordApi[];
}

export const getProductPredictions = (productId: number) =>
  api.get<PredictionDetailApi>(`/api/products/${productId}/predictions`);

export const runPrediction = (productId: number, periods?: number) =>
  api.post<PredictionDetailApi>(
    `/api/products/${productId}/predict`,
    periods ? { periods } : {},
  );

/** Data reorder point dan safety stock untuk 1 produk */
export interface ReorderInfoApi {
  product_id: number;
  lead_time_days: number;
  lead_time_source: 'supplier' | 'default';
  safety_stock: number;
  reorder_point: number;
  current_stock: number;
  needs_reorder: boolean;
}

export const getReorderInfo = (productId: number) =>
  api.get<ReorderInfoApi>(`/api/products/${productId}/reorder-info`);
