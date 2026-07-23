import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './tokenStorage';

// export const API_BASE_URL = __DEV__
//   ? 'http://localhost:8080'
//   : 'http://192.168.18.11:8080';
export const API_BASE_URL = 'http://192.168.18.11:8080';
// export const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request interceptor: nempelin Bearer token + logging saat dev ---
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      console.log(
        'API Request:',
        config.method?.toUpperCase(),
        config.baseURL ? config.baseURL + config.url : null,
      );
    }
    return config;
  },
  error => {
    if (__DEV__) console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

// --- Response interceptor: logging saat dev + auto-handle token expired (401) ---
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log('API Response:', response.status, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      console.error('Response Error:', error.response?.status, error.message);
      // Detail alasan penolakan dari backend (validasi, dsb) - hapus lagi nanti
      console.error(
        'Response Error Detail:',
        JSON.stringify(error.response?.data, null, 2),
      );
    }
    if (error.response?.status === 401) {
      await removeToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default api;
