import api from './api';

export type AdjustmentType = 'retur' | 'rugi';

export interface ExpiringProductApi {
  product_id: number;
  product_name: string;
  tanggal_kadaluwarsa: string; // DD/MM/YYYY
  total_remaining: number;
}

export const getExpiringProducts = (search?: string) =>
  api.get<ExpiringProductApi[]>('/api/stock-adjustments/expiring', {
    params: search ? { search } : undefined,
  });

export interface CreateAdjustmentInput {
  product_id: number;
  tanggal_kadaluwarsa: string; // ambil persis dari ExpiringProductApi
  quantity: string; // string desimal, mis. "5" atau "1.5"
  adjustment_type: AdjustmentType;
  note?: string;
}

export interface CreateAdjustmentResponseApi {
  id: number;
  product_id: number;
  tanggal_kadaluwarsa: string;
  quantity_adjusted: string; // STRING di response create
  adjustment_type: AdjustmentType;
  estimated_loss: number;
  note: string | null;
  created_by: number;
  created_at: string; // ISO
}

export const createAdjustment = (data: CreateAdjustmentInput) =>
  api.post<CreateAdjustmentResponseApi>('/api/stock-adjustments', data);

export interface AdjustmentHistoryParams {
  product_id?: number;
  adjustment_type?: AdjustmentType;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
}

export interface AdjustmentHistoryApi {
  id: number;
  product_id: number;
  product_name: string;
  tanggal_kadaluwarsa: string;
  quantity_adjusted: number; // NUMBER di response history - beda dari create!
  adjustment_type: AdjustmentType;
  estimated_loss: number;
  note: string | null;
  created_at: string; // format "DD/MM/YYYY HH:mm" - beda dari create yang ISO
}

export const getAdjustmentHistory = (params?: AdjustmentHistoryParams) =>
  api.get<AdjustmentHistoryApi[]>('/api/stock-adjustments/history', {
    params,
  });
