import api from './api';
import { ProductApi, ProductUnitApi } from './productService';

export type DiscountType = 'nominal' | 'percentage';

export interface TransactionItemInput {
  product_id: number;
  product_unit_id: number;
  quantity: string; // desimal sebagai string
}

export interface CreateTransactionInput {
  discount_type?: DiscountType;
  discount_value?: number;
  items: TransactionItemInput[];
}

export interface TransactionItemApi {
  id: number;
  transaction_id: number;
  product_id: number;
  product: ProductApi;
  product_unit_id: number;
  product_unit: ProductUnitApi;
  quantity: string;
  quantity_base: string;
  price_at_sale: number;
  cost_price: number;
  subtotal: number;
}

export interface TransactionApi {
  id: number;
  transaction_code: string;
  transaction_date: string; // format: DD/MM/YYYY HH:mm
  total_quantity: string; // desimal, string
  total_amount: number;
  discount_type: DiscountType | null;
  discount_value: number | null;
  final_amount: number;
  items: TransactionItemApi[];
}

export interface TransactionFilters {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
}

export const getTransactions = (filters?: TransactionFilters) =>
  api.get<TransactionApi[]>('/api/transactions', { params: filters });

export const getTransactionById = (id: number) =>
  api.get<TransactionApi>(`/api/transactions/${id}`);

export const createTransaction = (data: CreateTransactionInput) =>
  api.post<TransactionApi>('/api/transactions', data);
