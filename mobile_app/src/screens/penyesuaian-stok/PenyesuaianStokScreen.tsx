import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Plus, History, PackageX } from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import { Colors } from '../../styles';
import {
  getExpiringProducts,
  ExpiringProductApi,
} from '../../services/stockAdjustmentService';
import { useToast } from '../../contexts/ToastContext';
import { DashboardStackParamList } from '../../navigation/types';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'PenyesuaianStok'
>;

const PenyesuaianStokScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const [items, setItems] = useState<ExpiringProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = useCallback(async (search?: string) => {
    try {
      const response = await getExpiringProducts(search || undefined);

      // Backend belum punya parameter buat batasi rentang tanggal, jadi
      // difilter di sini: tampilkan yang kadaluwarsa dalam 5 bulan ke depan
      // (termasuk yang sudah lewat - itu malah paling mendesak).
      const fiveMonthsFromNow = new Date();
      fiveMonthsFromNow.setMonth(fiveMonthsFromNow.getMonth() + 5);

      const filtered = response.data.filter(item => {
        const [day, month, year] = item.tanggal_kadaluwarsa
          .split('/')
          .map(Number);
        const expiryDate = new Date(year, month - 1, day);
        return expiryDate <= fiveMonthsFromNow;
      });

      setItems(filtered);
    } catch (error) {
      toast.error('Gagal memuat data barang mendekati kadaluwarsa');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems(searchQuery);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    fetchItems(text);
  };

  const handleSelectItem = (item: ExpiringProductApi) => {
    navigation.navigate('TambahPenyesuaian', {
      productId: item.product_id,
      productName: item.product_name,
      tanggalKadaluwarsa: item.tanggal_kadaluwarsa,
      maxQuantity: item.total_remaining,
    });
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
      title="Penyesuaian Stok"
      subtitle="Retur & Barang Rusak"
      scrollable={false}
    >
      <View style={styles.searchContainer}>
        <Search size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama barang..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('TambahPenyesuaian', {})}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('RiwayatPenyesuaian', {})}
        >
          <History size={18} color={Colors.primary} />
          <Text style={styles.historyButtonText}>Riwayat</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) =>
          `${item.product_id}-${item.tanggal_kadaluwarsa}-${index}`
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handleSelectItem(item)}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.product_name}
              </Text>
              <Text style={styles.expiryText}>
                Kadaluwarsa: {item.tanggal_kadaluwarsa}
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{item.total_remaining}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <PackageX size={40} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Barang tidak ditemukan'
                : 'Tidak ada barang mendekati kadaluwarsa'}
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default PenyesuaianStokScreen;
