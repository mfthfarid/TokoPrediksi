import api from './api';

export interface UnitApi {
  id: number;
  name: string;
}

export const getUnits = () => api.get<UnitApi[]>('/api/units');
