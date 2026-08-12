import api from './api';

export interface UserApi {
  id: number;
  name: string;
  email: string;
}

export const getCurrentUser = () => api.get<UserApi>('/api/users/me');

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export const updateProfile = (data: UpdateProfileInput) =>
  api.put<UserApi>('/api/users/me', data);

export interface UpdatePasswordInput {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export const updatePassword = (data: UpdatePasswordInput) =>
  api.put<{ message: string }>('/api/users/me/password', data);
