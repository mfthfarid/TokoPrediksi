import api from './api';

export interface CategoryApi {
  id: number;
  name: string;
}

export interface CategoryInput {
  name: string;
}

export const getCategories = () => api.get<CategoryApi[]>('/api/categories');

export const createCategory = (data: CategoryInput) =>
  api.post<CategoryApi>('/api/categories', data);

export const updateCategory = (id: number, data: CategoryInput) =>
  api.put<CategoryApi>(`/api/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  api.delete(`/api/categories/${id}`);
