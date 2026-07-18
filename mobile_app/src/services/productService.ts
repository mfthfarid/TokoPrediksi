import api from './api';

export interface ProductUnitInput {
  id_unit: number;
  conversion_to_base: string; // desimal dikirim sebagai string, misal "1.5"
  price: string;
  barcode?: string;
}

export interface CreateProductInput {
  name: string;
  id_kategori: number;
  units: ProductUnitInput[];
}

export const getProducts = () => api.get('/api/products');

export const getProductById = (id: number) => api.get(`/api/products/${id}`);

export const addProduct = (data: CreateProductInput) =>
  api.post('/api/products', data);

export const updateProduct = (id: number, data: Partial<CreateProductInput>) =>
  api.put(`/api/products/${id}`, data);

export const getProductByBarcode = (barcode: string) =>
  api.get(`/api/products/scan/${barcode}`);

export const getProductUnits = (id: number) =>
  api.get(`/api/products/${id}/units`);
