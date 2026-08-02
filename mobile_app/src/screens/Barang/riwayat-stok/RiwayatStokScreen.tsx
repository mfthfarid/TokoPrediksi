import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import {
  PackagePlus,
  PackageMinus,
  RotateCcw,
  AlertOctagon,
  History as HistoryIcon,
} from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import { Colors } from '../../../styles';
import {
  getStockHistory,
  StockHistoryApi,
} from '../../../services/productService';
import { useToast } from '../../../contexts/ToastContext';
import { BarangStackParamList } from '../../../navigation/types';
import styles from './styles';

type RoutePropType = RouteProp<BarangStackParamList, 'RiwayatStok'>;

const parseIndoDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'masuk':
      return { icon: PackagePlus, color: '#16a34a', bg: '#dcfce7', sign: '+' };
    case 'keluar':
      return { icon: PackageMinus, color: '#2563eb', bg: '#dbeafe', sign: '-' };
    case 'retur':
      return { icon: RotateCcw, color: '#f59e0b', bg: '#fef3c7', sign: '-' };
    case 'rugi':
      return { icon: AlertOctagon, color: '#dc2626', bg: '#fee2e2', sign: '-' };
    default:
      return {
        icon: HistoryIcon,
        color: Colors.textSecondary,
        bg: '#f3f4f6',
        sign: '',
      };
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'masuk':
      return 'Barang Masuk';
    case 'keluar':
      return 'Barang Keluar';
    case 'retur':
      return 'Retur Supplier';
    case 'rugi':
      return 'Barang Rusak';
    default:
      return type;
  }
};

const RiwayatStokScreen = () => {
  const route = useRoute<RoutePropType>();
  const { productId, productName } = route.params;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<StockHistoryApi[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await getStockHistory(productId);
      // Terbaru dulu - parse format DD/MM/YYYY manual karena bukan ISO
      const sorted = [...response.data].sort(
        (a, b) =>
          parseIndoDate(b.date).getTime() - parseIndoDate(a.date).getTime(),
      );
      setHistory(sorted);
    } catch (error) {
      toast.error('Gagal memuat riwayat stok');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout
      title="Riwayat Stok"
      subtitle={productName}
      scrollable={false}
    >
      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.date}-${item.type}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const config = getTypeConfig(item.type);
          const Icon = config.icon;

          return (
            <View style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                <Icon size={18} color={config.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
                <Text style={styles.reference} numberOfLines={2}>
                  {item.reference}
                </Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={[styles.quantity, { color: config.color }]}>
                {config.sign}
                {item.quantity}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <HistoryIcon size={40} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada riwayat stok</Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default RiwayatStokScreen;
