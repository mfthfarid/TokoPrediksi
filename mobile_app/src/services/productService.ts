import api, { API_BASE_URL } from './api';
import { getToken } from './tokenStorage';
import RNBlobUtil from 'react-native-blob-util';

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
  is_active: boolean; // satuan masih dijual atau tidak
}

export interface ProductApi {
  id: number;
  name: string;
  stock: string; // desimal sebagai string, mis. "380" atau "12.50"
  id_kategori: number;
  kategori: {
    id: number;
    name: string;
  } | null;
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
  is_active?: boolean; // opsional, backend default TRUE kalau tidak dikirim
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

export interface UpdateProductInput {
  name: string;
  id_kategori: number;
}

// PUT /api/products/:id CUMA untuk field produk (name, id_kategori).
// Satuan (units) wajib dikelola lewat endpoint terpisah di bawah.
export const updateProduct = (id: number, data: UpdateProductInput) =>
  api.put<ProductApi>(`/api/products/${id}`, data);

// Soft delete - backend akan menolak (400) kalau stok masih tersisa
export const deleteProduct = (id: number) => api.delete(`/api/products/${id}`);

export const addUnit = (productId: number, data: ProductUnitInput) =>
  api.post<ProductUnitApi>(`/api/products/${productId}/units`, data);

export const updateUnit = (
  productId: number,
  unitId: number,
  data: Partial<ProductUnitInput>,
) =>
  api.put<ProductUnitApi>(`/api/products/${productId}/units/${unitId}`, data);

export const deleteUnit = (productId: number, unitId: number) =>
  api.delete(`/api/products/${productId}/units/${unitId}`);

// Endpoint TERPISAH khusus harga (kemungkinan buat nyatet price_history).
// Bentuk body ini masih tebakan - perlu diverifikasi pas testing.
export const updateUnitPrice = (
  productId: number,
  unitId: number,
  newPrice: number,
) =>
  api.put<ProductUnitApi>(`/api/products/${productId}/units/${unitId}/price`, {
    new_price: newPrice,
  });

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
export const uploadProductPhoto = async (
  id: number,
  fileUri: string,
): Promise<ProductApi> => {
  const token = await getToken();
  // RNBlobUtil.wrap butuh path tanpa prefix 'file://'
  const localPath = fileUri.replace('file://', '');

  if (__DEV__) {
    console.log(
      'Uploading photo (blob-util) to',
      `${API_BASE_URL}/api/products/${id}/photo`,
    );
  }

  const response = await RNBlobUtil.config({ timeout: 30000 }).fetch(
    'POST',
    `${API_BASE_URL}/api/products/${id}/photo`,
    {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'multipart/form-data',
    },
    [
      {
        name: 'photo',
        filename: `product_${id}.jpg`,
        type: 'image/jpeg',
        data: RNBlobUtil.wrap(localPath),
      },
    ],
  );

  const status = response.info().status;
  if (__DEV__) {
    console.log('Upload photo response status:', status);
  }

  if (status < 200 || status >= 300) {
    let errText = '';
    try {
      errText = await response.text();
    } catch (e) {
      // ignore
    }
    throw new Error(errText || `Upload gagal (status ${status})`);
    // throw new Error(response.text() || `Upload gagal (status ${status})`);
  }

  return response.json();
};
