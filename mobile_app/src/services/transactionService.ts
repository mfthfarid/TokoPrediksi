import api from './api';

export type DiscountType = 'nominal' | 'percentage';

export interface CreateTransactionItemInput {
  product_id: number;
  product_unit_id: number;
  quantity: string; // desimal sebagai string, konsisten sama konvensi lain
}

export interface CreateTransactionInput {
  discount_type?: DiscountType;
  discount_value?: number;
  items: CreateTransactionItemInput[];
}

// PERINGATAN: bentuk response ini belum pernah divalidasi ke response asli
// (DTO yang dikasih cuma buat request/create). Kalau ada field yang beda,
// cukup sesuaikan tipe di sini, screen-nya tidak perlu diubah.
export interface TransactionItemApi {
  id: number;
  product_id: number;
  product_unit_id: number;
  quantity: string;
  sell_price: number;
  subtotal: number;
}

export interface TransactionApi {
  id: number;
  total_amount: number;
  discount_type: DiscountType | null;
  discount_value: number | null;
  items: TransactionItemApi[];
  created_at: string;
}

export const getTransactions = () =>
  api.get<TransactionApi[]>('/api/transactions');

export const getTransaction = (id: number) =>
  api.get<TransactionApi>(`/api/transactions/${id}`);

export const createTransaction = (data: CreateTransactionInput) =>
  api.post<TransactionApi>('/api/transactions', data);
