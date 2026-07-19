import { useState, useEffect, useCallback } from 'react';
import { getProducts, ProductApi } from '../services/productService';
import { InventoryItem } from '../types/types';

const LOW_STOCK_THRESHOLD = 10;

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const mapProductToInventoryItem = (product: ProductApi): InventoryItem => {
  // Ambil satuan dasar (is_base_unit) sebagai harga acuan yang ditampilkan
  // di list. Kalau karena suatu hal tidak ada yang ditandai base unit,
  // fallback ke unit pertama supaya tetap ada sesuatu yang ditampilkan.
  const baseUnit = product.units.find(u => u.is_base_unit) ?? product.units[0];

  const stock = parseFloat(product.stock) || 0;

  return {
    id: product.id,
    nama: product.name,
    stok: stock,
    harga:
      baseUnit?.sell_price != null
        ? `${formatRupiah(baseUnit.sell_price)} / ${baseUnit.unit.name}`
        : 'Harga belum diatur',
    status: stock < LOW_STOCK_THRESHOLD ? 'low' : 'normal',
  };
};

export const useProducts = () => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProducts();

      if (!Array.isArray(response.data)) {
        throw new Error('Format data tidak valid dari server');
      }

      const mapped = response.data.map(mapProductToInventoryItem);
      setProducts(mapped);
    } catch (err: any) {
      let errorMessage = 'Gagal mengambil data produk';

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Waktu permintaan habis. Server tidak merespons.';
      } else if (err.response) {
        errorMessage = `Server Error: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage =
          'Tidak dapat terhubung ke server. Pastikan:\n1. Server aktif\n2. IP dan port benar\n3. Jaringan stabil\n4. Firewall tidak memblokir';
      } else {
        errorMessage = err.message || 'Terjadi kesalahan tak terduga';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};
