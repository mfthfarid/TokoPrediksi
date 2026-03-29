// mobile/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { InventoryItem } from '../types/types';

export const useProducts = () => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error sebelum request

        console.log(
          'Mencoba mengambil data dari:',
          'http://192.168.18.11:8080/products',
        );

        const response = await getProducts();

        console.log('Response berhasil diterima:', response.data);

        // Validasi response structure
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Format data tidak valid dari server');
        }

        // Mapping data
        const mapped = response.data.map((p: any) => ({
          id: p.id || Date.now() + Math.random(),
          nama: p.name || p.nama || 'Nama tidak tersedia',
          harga:
            p.price !== undefined
              ? `Rp ${Number(p.price).toLocaleString('id-ID')}`
              : 'Rp 0',
          stok: p.stock || p.stok || 0,
          status: (p.stock || p.stok || 0) < 10 ? 'low' : 'normal',
        }));

        setProducts(mapped);
        console.log('Data berhasil dimapping:', mapped);
      } catch (err: any) {
        console.error('Error fetching products:', err);

        let errorMessage = 'Gagal mengambil data produk';

        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Waktu permintaan habis. Server tidak merespons.';
        } else if (err.response) {
          // Server merespons dengan status error
          errorMessage = `Server Error: ${err.response.status} - ${err.response.statusText}`;
        } else if (err.request) {
          // Request dikirim tapi tidak ada response
          errorMessage =
            'Tidak dapat terhubung ke server. Pastikan:\n1. Server aktif\n2. IP dan port benar\n3. Jaringan stabil\n4. Firewall tidak memblokir';
        } else {
          errorMessage = err.message || 'Terjadi kesalahan tak terduga';
        }

        setError(errorMessage);
        console.error('Final error message:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
