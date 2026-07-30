import api from './api';

export interface PriceHistoryApi {
  id: number;
  product_unit_id: number;
  old_price: number | null;
  new_price: number;
  changed_by: number | null;
  created_at: string;
}

export const getPriceHistory = (productId: number, unitId: number) =>
  api.get<PriceHistoryApi[]>(
    `/api/products/${productId}/units/${unitId}/price-history`,
  );

export interface PriceInfoApi {
  unit_name: string;
  cost_per_base: number | null;
  cost_per_unit: number | null;
  current_sell_price: number | null;
}

export const getPriceInfo = (productId: number, unitId: number) =>
  api.get<PriceInfoApi>(
    `/api/products/${productId}/units/${unitId}/price-info`,
  );
