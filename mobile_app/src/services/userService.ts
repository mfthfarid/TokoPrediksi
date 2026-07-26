import api from './api';

export interface UserApi {
  id: number;
  name: string;
  email: string;
}

export const getCurrentUser = () => api.get<UserApi>('/api/users/me');
