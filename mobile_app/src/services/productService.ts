import api, { API_BASE_URL } from './api';
import { getToken } from './tokenStorage';

// ================================
// Bentuk data ASLI dari backend (response)
// ================================
export interface ProductUnitApi {
  id: number;
  product_id: number;
  unit_id: number;
  unit: {
    id: number;
    name: string;
  };
  barcode: string | null;
  conversion_to_base: string; // desimal sebagai string, mis. "11"
  sell_price: number | null; // null = belum diatur harganya untuk satuan ini
  is_base_unit: boolean;
}

export interface ProductApi {
  id: number;
  name: string;
  stock: string; // desimal sebagai string, mis. "380" atau "12.50"
  id_kategori: number;
  kategori: {
    id: number;
    name: string;
  };
  units: ProductUnitApi[];
  photo_url?: string | null;
  photo_thumbnail_url?: string | null;
  photo_detail_url?: string | null;
}

// ================================
// Bentuk data untuk dikirim (request)
// ================================
export interface ProductUnitInput {
  unit_id: number;
  conversion_to_base: string;
  sell_price?: number; // number, bukan string - beda dari conversion_to_base
  barcode?: string;
  is_base_unit: boolean;
}

export interface CreateProductInput {
  name: string;
  id_kategori: number;
  units: ProductUnitInput[];
}

// ================================
// Endpoint
// ================================
export const getProducts = () => api.get<ProductApi[]>('/api/products');

export const getProductById = (id: number) =>
  api.get<ProductApi>(`/api/products/${id}`);

export const addProduct = (data: CreateProductInput) =>
  api.post<ProductApi>('/api/products', data);

export const updateProduct = (id: number, data: Partial<CreateProductInput>) =>
  api.put(`/api/products/${id}`, data);

export const getProductByBarcode = (barcode: string) =>
  api.get<ProductApi>(`/api/products/scan/${barcode}`);

export const getProductUnits = (id: number) =>
  api.get<ProductUnitApi[]>(`/api/products/${id}/units`);

// fileUri: path lokal hasil PhotoPicker (sudah dikompres)
// PENTING: pakai fetch() native, BUKAN instance axios (api) di atas.
// Kombinasi axios + FormData + file lokal di React Native cukup rewel
// (banyak laporan "Network Error" tanpa sebab jelas di komunitas RN),
// sementara fetch() jauh lebih teruji untuk kasus upload file seperti ini.
// fetch() React Native TIDAK punya timeout bawaan (beda dari axios yang
// sudah kita set 15000ms) - tanpa ini, kalau koneksi nyangkut, request bisa
// nunggu SELAMANYA (persis gejala "loading tidak selesai-selesai").
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Waktu upload foto habis, coba lagi.'));
    }, ms);

    promise.then(
      result => {
        clearTimeout(timer);
        resolve(result);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
};

export const uploadProductPhoto = async (
  id: number,
  fileUri: string,
): Promise<ProductApi> => {
  const token = await getToken();

  const formData = new FormData();
  formData.append('photo', {
    uri: fileUri,
    type: 'image/jpeg',
    name: `product_${id}.jpg`,
  } as any);

  if (__DEV__) {
    console.log(
      'Uploading photo to',
      `${API_BASE_URL}/api/products/${id}/photo`,
    );
  }

  const response = await withTimeout(
    fetch(`${API_BASE_URL}/api/products/${id}/photo`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/json',
        // Sengaja TIDAK set Content-Type - fetch otomatis generate
        // 'multipart/form-data; boundary=...' yang benar sendiri.
      },
      body: formData,
    }),
    30000, // 30 detik, lebih longgar dari axios karena file lebih besar
  );

  if (__DEV__) {
    console.log('Upload photo response status:', response.status);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Upload gagal (status ${response.status})`);
  }

  return response.json();
};
