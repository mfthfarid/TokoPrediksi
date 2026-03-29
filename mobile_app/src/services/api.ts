// mobile/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://192.168.18.11:8080'; // Gunakan IP yang sama seperti sebelumnya

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Tambahkan timeout 15 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk logging (opsional, untuk debugging)
api.interceptors.request.use(
  config => {
    console.log(
      'API Request:',
      config.method?.toUpperCase(),
      config.baseURL + config.url,
    );
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  },
);

export const getProducts = () => api.get('/products');
export const getProductById = (id: number) => api.get(`/products/${id}`);
export const addProduct = (data: {
  name: string;
  price: number;
  stock: number;
}) => api.post('/products', data);

export default api;
