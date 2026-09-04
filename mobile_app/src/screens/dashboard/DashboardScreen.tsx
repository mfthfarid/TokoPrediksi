import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Wallet,
  Receipt,
  Package,
  AlertTriangle,
  LayoutGrid,
  Truck,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ShoppingBag,
  FileText,
  PackageMinus,
  Ruler,
  Tags,
} from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import { Colors } from '../../styles';
import {
  getDashboardSummary,
  DashboardSummaryApi,
} from '../../services/dashboardService';
import { getCurrentUser } from '../../services/userService';
import { useDoubleBackExit } from '../../hooks/useDoubleBackExit';
import { DashboardStackParamList } from '../../navigation/types';
import { useToast } from '../../contexts/ToastContext';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'Dashboard'
>;

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const formatPercentage = (value: number): string =>
  `${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`;

const DashboardScreen = () => {
  const toast = useToast();
  const navigation = useNavigation<NavigationProp>();
  useDoubleBackExit();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [summary, setSummary] = useState<DashboardSummaryApi | null>(null);
  const [lowStockExpanded, setLowStockExpanded] = useState(false);
  const [bestSellerExpanded, setBestSellerExpanded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, summaryRes] = await Promise.all([
        getCurrentUser(),
        getDashboardSummary(),
      ]);
      setUserName(userRes.data.name);
      setSummary(summaryRes.data);
    } catch (error) {
      // Dashboard tetap ditampilkan walau gagal (nggak block user),
      // cuma datanya kosong/0 - beda dari screen lain yang blocking error.
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleGoToBarang = () => {
    // Navigasi lintas-tab (Dashboard -> tab Barang), lewat parent tab navigator
    navigation.getParent()?.navigate('BarangTab' as never);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // const lowStockItems = summary?.low_stock_products ?? [];
  // const bestSellers = summary?.top_selling_products ?? [];
  // Ekstrak nilainya agar rapi
  const lowStockItems = summary?.low_stock_products ?? [];
  const bestSellers = summary?.top_selling_products ?? [];
  const profitMargin = summary?.profit_margin_today ?? 0;
  const lowStockCount = summary?.low_stock_count ?? 0;

  return (
    <ScreenLayout
      title={'Dashboard'}
      onNotificationPress={() => navigation.navigate('Notifikasi')}
    >
      {/* Sambutan */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          {`${getGreeting()}, ${userName || '...'}`}
        </Text>
      </View>

      {/* Grid statistik 2x2 */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Wallet size={20} color={Colors.primary} />
          <Text style={styles.statLabel}>Penjualan Hari Ini</Text>
          <Text style={styles.statValue}>
            {formatRupiah(summary?.total_sales_today ?? 0)}
          </Text>
        </View>
        <View style={styles.statCard}>
          {/* Ikon ikut berubah warna menyesuaikan margin */}
          <TrendingUp
            size={20}
            color={profitMargin < 0 ? '#f44336' : '#4caf50'}
          />
          <Text style={styles.statLabel}>Laba Hari Ini</Text>
          <Text style={styles.statValue}>
            {formatRupiah(summary?.total_profit_today ?? 0)}
            <Text
              style={[
                styles.statValueSuffix,
                profitMargin < 0 ? styles.textDanger : styles.textSuccess,
              ]}
            >
              {' '}
              ({formatPercentage(profitMargin)})
            </Text>
          </Text>
        </View>

        {/* Jumlah Transaksi Hari Ini */}
        <View style={styles.statCard}>
          <Receipt size={20} color={Colors.primary} />
          <Text style={styles.statLabel}>Transaksi Hari Ini</Text>
          <Text style={styles.statValue}>
            {summary?.total_transactions_today ?? 0}
          </Text>
        </View>

        {/* Stok Menipis */}
        <View style={styles.statCard}>
          {/* Ikon Alert hijau jika stok aman (0), kuning/orange jika ada yang menipis */}
          <AlertTriangle
            size={20}
            color={lowStockCount === 0 ? '#4caf50' : '#ff9800'}
          />
          <Text style={styles.statLabel}>Stok Menipis</Text>
          <Text
            style={[
              styles.statValue,
              lowStockCount === 0
                ? styles.textSuccess
                : styles.statValueWarning,
            ]}
          >
            {lowStockCount}
          </Text>
        </View>
      </View>

      {/* Prediksi */}
      {(summary?.predicted_stockout_count ?? 0) > 0 && (
        <TouchableOpacity
          style={styles.stockoutBanner}
          onPress={() =>
            navigation.getParent()?.navigate('PrediksiTab' as never)
          }
        >
          <Sparkles size={16} color="#fff" />
          <Text style={styles.stockoutBannerText}>
            {summary?.predicted_stockout_count} produk berpotensi kehabisan
            stok, cek Prediksi
          </Text>
          <Text style={styles.stockoutBannerArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Card Stok Menipis */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Stok Menipis</Text>
          <TouchableOpacity onPress={handleGoToBarang}>
            <Text style={styles.cardLink}>Kelola</Text>
          </TouchableOpacity>
        </View>
        {lowStockItems.length === 0 ? (
          <Text style={styles.emptyText}>Semua stok aman</Text>
        ) : (
          <>
            {(lowStockExpanded ? lowStockItems : lowStockItems.slice(0, 3)).map(
              item => (
                <View key={item.id} style={styles.listRow}>
                  <Text style={styles.listRowText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.listRowWarning}>
                    Tersisa {item.stock}
                  </Text>
                </View>
              ),
            )}
            {lowStockItems.length > 3 && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setLowStockExpanded(prev => !prev)}
              >
                <Text style={styles.expandButtonText}>
                  {lowStockExpanded
                    ? 'Sembunyikan'
                    : `Lihat Semua (${lowStockItems.length})`}
                </Text>
                <ChevronDown
                  size={14}
                  color={Colors.primary}
                  style={lowStockExpanded ? styles.chevronFlipped : undefined}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Card Barang Terlaris */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Barang Terlaris</Text>
        </View>
        {bestSellers.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada data penjualan</Text>
        ) : (
          <>
            {(bestSellerExpanded ? bestSellers : bestSellers.slice(0, 3)).map(
              item => (
                <View key={item.id} style={styles.listRow}>
                  <Text style={styles.listRowText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.listRowBold}>{item.total_sold}x</Text>
                </View>
              ),
            )}
            {bestSellers.length > 3 && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setBestSellerExpanded(prev => !prev)}
              >
                <Text style={styles.expandButtonText}>
                  {bestSellerExpanded
                    ? 'Sembunyikan'
                    : `Lihat Semua (${bestSellers.length})`}
                </Text>
                <ChevronDown
                  size={14}
                  color={Colors.primary}
                  style={bestSellerExpanded ? styles.chevronFlipped : undefined}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Menu Lainnya */}
      <Text style={styles.menuSectionTitle}>Menu Lainnya</Text>
      <View style={styles.menuGrid}>
        {/* Kategori */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Kategori')}
        >
          <View style={styles.menuIconBox}>
            <Tags size={22} color={Colors.primary} />
          </View>
          <Text style={styles.menuItemText}>Kategori</Text>
        </TouchableOpacity>

        {/* Satuan */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Satuan')}
        >
          <View style={styles.menuIconBox}>
            <Ruler size={22} color={Colors.primary} />
          </View>
          <Text style={styles.menuItemText}>Satuan</Text>
        </TouchableOpacity>

        {/* Supplier */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Supplier')}
        >
          <View style={styles.menuIconBox}>
            <Truck size={22} color={Colors.primary} />
          </View>
          <Text style={styles.menuItemText}>Supplier</Text>
        </TouchableOpacity>

        {/* Pembelian */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Pembelian')}
        >
          <View style={styles.menuIconBox}>
            <ShoppingBag size={22} color={Colors.primary} />
          </View>
          <Text style={styles.menuItemText}>Pembelian</Text>
        </TouchableOpacity>

        {/* Penyesuaian Stok */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('PenyesuaianStok')}
        >
          <View style={styles.menuIconBox}>
            <PackageMinus size={22} color={Colors.primary} />
          </View>
          <Text style={styles.menuItemText}>Penyesuaian</Text>
        </TouchableOpacity>

        {/* Laporan */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => toast.info('Fitur ini akan segera hadir!')}
        >
          <View style={styles.menuIconBox}>
            <FileText size={22} color={Colors.primary} />
          </View>
          <Text style={styles.menuItemText}>Laporan</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};

export default DashboardScreen;
