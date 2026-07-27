import api from './api';

export interface SupplierApi {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
}

export interface SupplierInput {
  name: string;
  phone?: string;
  address?: string;
}

export const getSuppliers = () => api.get<SupplierApi[]>('/api/suppliers');

export const createSupplier = (data: SupplierInput) =>
  api.post<SupplierApi>('/api/suppliers', data);

export const updateSupplier = (id: number, data: SupplierInput) =>
  api.put<SupplierApi>(`/api/suppliers/${id}`, data);

export const deleteSupplier = (id: number) =>
  api.delete(`/api/suppliers/${id}`);
