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
  run_id?: string;
  generated_at?: string;
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
  display_unit?: string;
  current_stock_display?: string;
  average_daily_sales_display?: string;
}

export const getProductPredictions = (productId: number) =>
  api.get<PredictionDetailApi>(`/api/products/${productId}/predictions`);

export const runPrediction = (productId: number, periods?: number) =>
  api.post<PredictionDetailApi>(
    `/api/products/${productId}/predict`,
    periods ? { periods } : {},
  );

/** Data reorder point dan safety stock untuk 1 produk (Colab v4 & Backend ROP) */
export interface ReorderInfoApi {
  product_id: number;
  product_name?: string;
  current_stock: number;
  lead_time_days: number;
  lead_time_source: 'supplier' | 'default';
  service_level?: number;
  t_source?: 'computed' | 'seed' | 'seed_approx' | 'none';

  has_prediction?: boolean;
  prediction_stale?: boolean;

  demand_lead_time?: number | null; // D_L
  safety_stock: number;             // Safety stock empiris (T)
  reorder_point: number;            // ROP = max(0, D_L + T)
  status?: 'safe' | 'near' | 'below_rop' | 'unknown';
  recommended_purchase_quantity?: number | null;
  recommendation_available?: boolean;
  needs_reorder: boolean;

  display_unit?: string;
  current_stock_display?: string;
  demand_lead_time_display?: string;
  safety_stock_display?: string;
  reorder_point_display?: string;
  recommended_purchase_display?: string;
}

export const getReorderInfo = (productId: number) =>
  api.get<ReorderInfoApi>(`/api/products/${productId}/reorder-info`);
