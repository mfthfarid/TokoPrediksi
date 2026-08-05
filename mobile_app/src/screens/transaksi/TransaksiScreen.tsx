import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  PackageX,
} from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useToast } from '../../contexts/ToastContext';
import { Colors } from '../../styles';
import styles from './styles';

// Catatan: Pastikan import getProducts disesuaikan dengan path Anda
// import { getProducts } from '../../services/productService';

// ==========================================
// 1. Definisi Tipe Data Lokal
// ==========================================
interface FlattenedProductUnit {
  product_id: number;
  product_name: string;
  unit_id: number;
  unit_name: string;
  price: number;
  stock: number; // Opsional, untuk peringatan stok
  photo_url: string | null;
}

interface CartItem extends FlattenedProductUnit {
  qty: number;
  subtotal: number;
}

const TransaksiScreen = () => {
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // State untuk daftar barang (satuan) dan keranjang
  const [availableUnits, setAvailableUnits] = useState<FlattenedProductUnit[]>(
    [],
  );
  const [cart, setCart] = useState<CartItem[]>([]);

  // ==========================================
  // 2. Fetch Data (Simulasi)
  // ==========================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Nanti ganti dengan API asli Anda:
        // const res = await getProducts();

        // --- SIMULASI DATA BACKEND ---
        const dummyData: FlattenedProductUnit[] = [
          {
            product_id: 1,
            product_name: 'Kopi Kapal Api',
            unit_id: 1,
            unit_name: 'Renceng',
            price: 12000,
            stock: 50,
            photo_url: null,
          },
          {
            product_id: 1,
            product_name: 'Kopi Kapal Api',
            unit_id: 2,
            unit_name: 'Dus',
            price: 115000,
            stock: 5,
            photo_url: null,
          },
          {
            product_id: 2,
            product_name: 'Indomie Goreng',
            unit_id: 3,
            unit_name: 'Pcs',
            price: 3000,
            stock: 100,
            photo_url: null,
          },
          {
            product_id: 2,
            product_name: 'Indomie Goreng',
            unit_id: 4,
            unit_name: 'Kardus',
            price: 110000,
            stock: 10,
            photo_url: null,
          },
        ];

        // Jika data asli Anda berbentuk hierarki (Produk -> Units[]),
        // Anda harus melalukan .flatMap() di sini untuk menjadikannya rata seperti di atas.

        setAvailableUnits(dummyData);
      } catch (error) {
        toast.error('Gagal memuat daftar barang');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // 3. Logika Keranjang (Cart)
  // ==========================================
  const addToCart = (unit: FlattenedProductUnit) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.unit_id === unit.unit_id);

      if (existingItem) {
        // Jika sudah ada, tambah qty
        return prevCart.map(item =>
          item.unit_id === unit.unit_id
            ? {
                ...item,
                qty: item.qty + 1,
                subtotal: (item.qty + 1) * item.price,
              }
            : item,
        );
      }

      // Jika belum ada, masukkan sebagai item baru
      return [...prevCart, { ...unit, qty: 1, subtotal: unit.price }];
    });
  };

  const removeFromCart = (unitId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.unit_id === unitId);
      if (!existingItem) return prevCart;

      if (existingItem.qty > 1) {
        // Kurangi qty
        return prevCart.map(item =>
          item.unit_id === unitId
            ? {
                ...item,
                qty: item.qty - 1,
                subtotal: (item.qty - 1) * item.price,
              }
            : item,
        );
      }

      // Hapus dari keranjang jika qty sisa 1 dan dikurangi lagi
      return prevCart.filter(item => item.unit_id !== unitId);
    });
  };

  // Kalkulasi Total
  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Filter Pencarian
  const filteredUnits = useMemo(() => {
    return availableUnits.filter(u =>
      u.product_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [availableUnits, searchQuery]);

  // ==========================================
  // 4. Render UI
  // ==========================================
  const renderUnitCard = ({ item }: { item: FlattenedProductUnit }) => {
    // Cek jumlah item ini di dalam keranjang
    const cartItem = cart.find(c => c.unit_id === item.unit_id);
    const qtyInCart = cartItem?.qty || 0;

    return (
      <TouchableOpacity
        style={[styles.card, qtyInCart > 0 && styles.cardActive]}
        onPress={() => addToCart(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product_name}
          </Text>
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>{item.unit_name}</Text>
          </View>
          <Text style={styles.priceText}>
            Rp {item.price.toLocaleString('id-ID')}
          </Text>
        </View>

        {/* Jika ada di keranjang, tampilkan kontrol +/- di atas kartu */}
        {qtyInCart > 0 && (
          <View style={styles.qtyControlOverlay}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={e => {
                e.stopPropagation();
                removeFromCart(item.unit_id);
              }}
            >
              <Minus size={16} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.qtyTextOverlay}>{qtyInCart}</Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={e => {
                e.stopPropagation();
                addToCart(item);
              }}
            >
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong!');
      return;
    }
    // Nanti diarahkan ke Modal / Layar Pembayaran
    toast.success(
      `Melanjutkan pembayaran Rp ${totalCartPrice.toLocaleString('id-ID')}`,
    );
  };

  // Komponen Footer (Keranjang)
  const CartFooter = (
    <View style={styles.footerContainer}>
      <View style={styles.cartInfo}>
        <ShoppingCart size={24} color={Colors.primary} />
        <View style={styles.cartTextContainer}>
          <Text style={styles.cartItemsText}>
            {totalCartItems} Item di Keranjang
          </Text>
          <Text style={styles.cartTotalText}>
            Rp {totalCartPrice.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>
      <PrimaryButton
        title="Bayar"
        onPress={handleCheckout}
        disabled={cart.length === 0}
        // style={{ width: 120 }}
      />
    </View>
  );

  return (
    <ScreenLayout
      title="Transaksi POS"
      scrollable={false} // Wajib false agar FlatList bisa scroll mandiri
      footer={CartFooter} // Memanfaatkan perbaikan ScreenLayout sebelumnya
    >
      <View style={styles.searchContainer}>
        <TextField
          placeholder="Cari barang..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={Colors.textSecondary} />}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredUnits.length === 0 ? (
        <View style={styles.centerContainer}>
          <PackageX size={48} color={Colors.border} />
          <Text style={styles.emptyText}>Barang tidak ditemukan</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUnits}
          keyExtractor={item => item.unit_id.toString()}
          renderItem={renderUnitCard}
          numColumns={2} // Menampilkan 2 kolom layaknya sistem POS
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ScreenLayout>
  );
};

export default TransaksiScreen;
