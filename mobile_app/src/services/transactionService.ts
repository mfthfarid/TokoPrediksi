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

// Menyesuaikan persis dengan response JSON backend terbaru
export interface TransactionItemApi {
  id: number;
  transaction_id: number;
  product_id: number;
  product_unit_id: number;
  quantity: string;
  quantity_base: string; // [BARU] Sesuai response JSON
  price_at_sale: number; // [DIUBAH] Sebelumnya sell_price, di database namanya price_at_sale
  cost_price: number; // [BARU]
  subtotal: number;
}

export interface TransactionApi {
  id: number;
  transaction_code: string; // [BARU] Tambahan dari backend
  transaction_date: string; // [BARU] Menggantikan fungsi created_at (menyimpan waktu spesifik)
  total_quantity: number; // [BARU] Hasil kalkulasi total item
  total_amount: number;
  discount_type: DiscountType | null;
  discount_value: number | null;
  final_amount: number; // [BARU] Sesuai response JSON
  items: TransactionItemApi[];
  created_at?: string; // Dibuat opsional jika backend GORM Anda mengirimkannya
  updated_at?: string;
}

export const getTransactions = () =>
  api.get<TransactionApi[]>('/api/transactions');

export const getTransaction = (id: number) =>
  api.get<TransactionApi>(`/api/transactions/${id}`);

export const createTransaction = (data: CreateTransactionInput) =>
  api.post<TransactionApi>('/api/transactions', data);
