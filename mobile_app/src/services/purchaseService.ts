import api from './api';
import { ProductApi, ProductUnitApi } from './productService';
import { SupplierApi } from './supplierService';

export interface PurchaseItemInput {
  product_id: number;
  product_unit_id: number;
  quantity: string;
  purchase_price: number; // TOTAL harga baris ini, BUKAN harga per satuan
  tanggal_kadaluwarsa?: string; // DD/MM/YYYY, opsional
}

export interface CreatePurchaseInput {
  supplier_id: number;
  purchase_date: string; // DD/MM/YYYY
  items: PurchaseItemInput[];
}

export interface PurchaseItemApi {
  id: number;
  purchase_id: number;
  product_id: number;
  product: ProductApi;
  product_unit_id: number;
  product_unit: ProductUnitApi;
  quantity: string;
  quantity_base: string;
  quantity_remaining: string;
  purchase_price: number;
  cost_per_base: number;
  tanggal_kadaluwarsa: string | null;
  subtotal: number;
}

export interface PurchaseApi {
  id: number;
  supplier_id: number;
  supplier: SupplierApi;
  purchase_date: string;
  total_amount: number;
  items: PurchaseItemApi[];
}

export const getPurchases = () => api.get<PurchaseApi[]>('/api/purchases');

export const createPurchase = (data: CreatePurchaseInput) =>
  api.post<PurchaseApi>('/api/purchases', data);

export const getPurchaseById = (id: number) =>
  api.get<PurchaseApi>(`/api/purchases/${id}`);

export const deletePurchase = (id: number) =>
  api.delete(`/api/purchases/${id}`);
