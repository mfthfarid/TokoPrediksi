import api from './api';

export interface CategoryApi {
  id: number;
  name: string;
}

export const getCategories = () => api.get<CategoryApi[]>('/api/categories');
