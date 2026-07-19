import api from './api';

// ================================
// Bentuk data ASLI dari backend (response)
// ================================
export interface ProductUnitApi {
  id: number;
  product_id: number;
  unit_id: number;
  unit: {
    id: number;
    name: string;
  };
  barcode: string | null;
  conversion_to_base: string; // desimal sebagai string, mis. "11"
  sell_price: number | null; // null = belum diatur harganya untuk satuan ini
  is_base_unit: boolean;
}

export interface ProductApi {
  id: number;
  name: string;
  stock: string; // desimal sebagai string, mis. "380" atau "12.50"
  id_kategori: number;
  kategori: {
    id: number;
    name: string;
  };
  units: ProductUnitApi[];
}

// ================================
// Bentuk data untuk dikirim (request)
// ================================
export interface ProductUnitInput {
  unit_id: number;
  conversion_to_base: string;
  sell_price?: string; // opsional - bisa diisi belakangan lewat EditBarang
  barcode?: string;
  is_base_unit: boolean;
}

export interface CreateProductInput {
  name: string;
  id_kategori: number;
  units: ProductUnitInput[];
}

// ================================
// Endpoint
// ================================
export const getProducts = () => api.get<ProductApi[]>('/api/products');

export const getProductById = (id: number) =>
  api.get<ProductApi>(`/api/products/${id}`);

export const addProduct = (data: CreateProductInput) =>
  api.post('/api/products', data);

export const updateProduct = (id: number, data: Partial<CreateProductInput>) =>
  api.put(`/api/products/${id}`, data);

export const getProductByBarcode = (barcode: string) =>
  api.get<ProductApi>(`/api/products/scan/${barcode}`);

export const getProductUnits = (id: number) =>
  api.get<ProductUnitApi[]>(`/api/products/${id}/units`);
