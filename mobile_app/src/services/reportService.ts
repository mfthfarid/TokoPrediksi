import api from './api';

export interface ProductProfit {
  product_id?: number;
  product_name: string;
  total_qty_sold: number;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin: number;
}

export interface GrandTotal {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin: number;
  total_transactions: number;
  total_items_sold: number;
}

export interface Comparison {
  revenue_change_percent: number;
  profit_change_percent: number;
}

export interface ProfitReportResponse {
  start_date: string;
  end_date: string;
  products: ProductProfit[];
  grand_total: GrandTotal;
  comparison: Comparison;
}

export interface ProfitReportParams {
  start_date: string;
  end_date: string;
  product_id?: number;
}

export const getProfitReport = (params: ProfitReportParams) =>
  api.get<ProfitReportResponse>('/api/reports/profit', {
    params,
  });
