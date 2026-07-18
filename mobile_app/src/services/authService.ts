import api from './api';

export const requestPasswordReset = (email: string) =>
  api.post('/auth/forgot-password', { email });

export interface ResetPasswordInput {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export const resetPassword = (data: ResetPasswordInput) =>
  api.post('/auth/reset-password', data);
