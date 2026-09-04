import api from './api';

export interface UnitApi {
  id: number;
  name: string;
}

export interface UnitInput {
  name: string;
}

export const getUnits = () => api.get<UnitApi[]>('/api/units');

export const createUnit = (data: UnitInput) =>
  api.post<UnitApi>('/api/units', data);

export const updateUnit = (id: number, data: UnitInput) =>
  api.put<UnitApi>(`/api/units/${id}`, data);

export const deleteUnit = (id: number) => api.delete(`/api/units/${id}`);
