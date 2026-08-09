import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, ScanLine, ShoppingCart, History } from 'lucide-react-native';
import { Colors } from '../../styles';
import {
  getProducts,
  getProductByBarcode,
  ProductApi,
  ProductUnitApi,
} from '../../services/productService';
import { createTransaction } from '../../services/transactionService';
import { useToast } from '../../contexts/ToastContext';
import ScreenLayout from '../../layouts/ScreenLayout';
import BarcodeScannerModal from '../../components/common/BarcodeScannerModal';
import CartModal from './cart/CartModal';
import PaymentModal from './payment/PaymentModal';
import { CartItem } from './types';
import styles from './styles';

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const TransaksiScreen = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'transaksi' | 'riwayat'>(
    'transaksi',
  );
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [scannerVisible, setScannerVisible] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      toast.error('Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts]),
  );

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map(p => p.kategori?.name ?? 'Tanpa Kategori')),
    );
    return ['Semua', ...unique];
  }, [products]);

  const filteredProducts = products.filter(item => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === 'Semua' ||
      (item.kategori?.name ?? 'Tanpa Kategori') === selectedCategory;
    return matchSearch && matchCategory;
  });

  const addToCart = (product: ProductApi, unit: ProductUnitApi) => {
    if (unit.sell_price == null) {
      toast.error('Harga satuan ini belum diatur');
      return;
    }

    const key = `${product.id}-${unit.id}`;
    setCart(prev => {
      const existing = prev.find(item => item.key === key);
      if (existing) {
        return prev.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          productUnitId: unit.id,
          productName: product.name,
          unitName: unit.unit.name,
          unitPrice: unit.sell_price as number,
          quantity: 1,
          maxQuantity: parseFloat(product.stock) || 0,
        },
      ];
    });
  };

  const handleIncrement = (key: string) => {
    setCart(prev =>
      prev.map(item =>
        item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const handleDecrement = (key: string) => {
    setCart(prev =>
      prev
        .map(item =>
          item.key === key ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter(item => item.quantity > 0),
    );
  };

  const handleRemove = (key: string) => {
    setCart(prev => prev.filter(item => item.key !== key));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const handleCheckout = () => {
    setCartVisible(false);
    setPaymentVisible(true);
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      await createTransaction({
        items: cart.map(item => ({
          product_id: item.productId,
          product_unit_id: item.productUnitId,
          quantity: String(item.quantity),
        })),
      });

      toast.success('Transaksi berhasil disimpan');
      setCart([]);
      setCashReceived('');
      setPaymentVisible(false);
      fetchProducts(); // refresh stok
    } catch (error: any) {
      const message =
        error.response?.data?.error || 'Gagal menyimpan transaksi';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const findUnitByBarcode = (
    barcode: string,
  ): { product: ProductApi; unit: ProductUnitApi } | null => {
    for (const product of products) {
      const unit = product.units.find(u => u.barcode === barcode);
      if (unit) return { product, unit };
    }
    return null;
  };

  const handleScanned = async (barcode: string) => {
    setScannerVisible(false);

    const localMatch = findUnitByBarcode(barcode);
    if (localMatch) {
      addToCart(localMatch.product, localMatch.unit);
      toast.success(`${localMatch.product.name} ditambahkan`);
      return;
    }

    try {
      const response = await getProductByBarcode(barcode);
      const product = response.data;
      const unit = product.units.find(u => u.barcode === barcode);
      if (unit) {
        addToCart(product, unit);
        toast.success(`${product.name} ditambahkan`);
      } else {
        toast.error('Barcode ditemukan tapi satuan tidak cocok');
      }
    } catch (error) {
      toast.error('Produk dengan barcode ini tidak ditemukan');
    }
  };

  const handleOpenScanner = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Izin Kamera',
          message: 'Aplikasi butuh akses kamera untuk scan barcode.',
          buttonPositive: 'Izinkan',
          buttonNegative: 'Batal',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        toast.error('Izin kamera ditolak');
        return;
      }
    }
    setScannerVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout
      title="Transaksi"
      paddingHorizontal={0}
      paddingVertical={0}
      scrollable={false}
    >
      <View style={styles.container}>
        {/* Tab Transaksi / Riwayat */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'transaksi' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('transaksi')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'transaksi' && styles.tabTextActive,
              ]}
            >
              Transaksi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'riwayat' && styles.tabButtonActive,
            ]}
            onPress={() =>
              toast.error('Riwayat transaksi masih dalam pengembangan')
            }
          >
            <View style={styles.tabRiwayatContent}>
              <History
                size={14}
                color={activeTab === 'riwayat' ? '#fff' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'riwayat' && styles.tabTextActive,
                ]}
              >
                Riwayat
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Search + scan */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Search size={18} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari nama barang..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleOpenScanner}
            >
              <ScanLine size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Filter kategori */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item, index) => `${item}-${index}`}
            style={styles.categoryList}
            contentContainerStyle={styles.categoryListContent}
            renderItem={({ item }) => {
              const isActive = item === selectedCategory;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.categoryChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Grid produk */}
          <FlatList
            style={styles.productList}
            data={filteredProducts}
            keyExtractor={item => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const activeUnits = item.units.filter(u => u.is_active);
              const stock = parseFloat(item.stock) || 0;

              return (
                <View style={styles.card}>
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.stockText}>Stok {stock}</Text>

                  <View style={styles.unitButtonsRow}>
                    {activeUnits.length === 0 && (
                      <Text style={styles.noUnitText}>
                        Belum ada satuan aktif
                      </Text>
                    )}
                    {activeUnits.map(unit => (
                      <TouchableOpacity
                        key={unit.id}
                        style={styles.unitButton}
                        onPress={() => addToCart(item, unit)}
                        disabled={unit.sell_price == null}
                      >
                        <Text style={styles.unitButtonName} numberOfLines={1}>
                          {unit.unit.name}
                        </Text>
                        <Text style={styles.unitButtonPrice}>
                          {unit.sell_price != null
                            ? formatRupiah(unit.sell_price)
                            : '-'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Barang tidak ditemukan</Text>
              </View>
            }
          />
        </View>

        {/* Floating cart bar */}
        {cart.length > 0 && (
          <TouchableOpacity
            style={styles.cartBar}
            activeOpacity={0.8}
            onPress={() => setCartVisible(true)}
          >
            <View style={styles.cartBarLeft}>
              <ShoppingCart size={18} color="#fff" />
              <Text style={styles.cartBarText}>
                {cart.reduce((sum, i) => sum + i.quantity, 0)} item
              </Text>
            </View>
            <Text style={styles.cartBarTotal}>{formatRupiah(cartTotal)}</Text>
          </TouchableOpacity>
        )}

        <CartModal
          visible={cartVisible}
          items={cart}
          total={cartTotal}
          onClose={() => setCartVisible(false)}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
          onCheckout={handleCheckout}
        />

        <PaymentModal
          visible={paymentVisible}
          total={cartTotal}
          submitting={submitting}
          cashReceived={cashReceived}
          onChangeCashReceived={setCashReceived}
          onClose={() => setPaymentVisible(false)}
          onConfirm={handleConfirmPayment}
        />

        <BarcodeScannerModal
          visible={scannerVisible}
          onClose={() => setScannerVisible(false)}
          onScanned={handleScanned}
        />
      </View>
    </ScreenLayout>
  );
};

export default TransaksiScreen;
