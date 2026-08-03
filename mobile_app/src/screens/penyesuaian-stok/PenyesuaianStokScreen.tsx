import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, History, PackageX, ChevronRight } from 'lucide-react-native';
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

  const fetchItems = useCallback(async () => {
    try {
      // Backend sudah filter "mendekati kadaluwarsa" sendiri di /expiring,
      // tidak perlu filter tambahan di mobile lagi.
      const response = await getExpiringProducts();
      setItems(response.data);
    } catch (error) {
      toast.error('Gagal memuat data barang mendekati kadaluwarsa');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems]),
  );

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
      subtitle="Barang Mendekati Kadaluwarsa"
      scrollable={false}
    >
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('TambahPenyesuaian', {})}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addButtonText}>Tambah (Barang Rusak)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('RiwayatPenyesuaian', {})}
        >
          <History size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) =>
          `${item.product_id}-${item.tanggal_kadaluwarsa}-${index}`
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.product_name}
              </Text>
              <Text style={styles.expiryText}>
                Kadaluwarsa: {item.tanggal_kadaluwarsa}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  Sisa {item.total_remaining}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSelectItem(item)}
            >
              <Text style={styles.actionButtonText}>Sesuaikan</Text>
              <ChevronRight size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <PackageX size={40} color="#ccc" />
            <Text style={styles.emptyText}>
              Tidak ada barang mendekati kadaluwarsa
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default PenyesuaianStokScreen;
