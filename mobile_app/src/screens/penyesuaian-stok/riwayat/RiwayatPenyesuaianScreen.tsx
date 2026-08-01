import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { RotateCcw, AlertOctagon, Inbox } from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import { Colors } from '../../../styles';
import {
  getAdjustmentHistory,
  AdjustmentHistoryApi,
  AdjustmentType,
} from '../../../services/stockAdjustmentService';
import { useToast } from '../../../contexts/ToastContext';
import { DashboardStackParamList } from '../../../navigation/types';
import styles from './styles';

type RoutePropType = RouteProp<DashboardStackParamList, 'RiwayatPenyesuaian'>;

type FilterType = 'semua' | AdjustmentType;

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const RiwayatPenyesuaianScreen = () => {
  const route = useRoute<RoutePropType>();
  const productId = route.params?.productId;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AdjustmentHistoryApi[]>([]);
  const [filter, setFilter] = useState<FilterType>('semua');

  const fetchHistory = useCallback(
    async (activeFilter: FilterType) => {
      try {
        const response = await getAdjustmentHistory({
          product_id: productId,
          adjustment_type: activeFilter === 'semua' ? undefined : activeFilter,
        });
        setHistory(response.data);
      } catch (error) {
        toast.error('Gagal memuat riwayat penyesuaian');
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [productId],
  );

  useFocusEffect(
    useCallback(() => {
      fetchHistory(filter);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]),
  );

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    setLoading(true);
    fetchHistory(value);
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
      title="Riwayat Penyesuaian"
      subtitle={productId ? 'Produk Ini' : 'Semua Barang'}
      scrollable={false}
    >
      <View style={styles.filterRow}>
        {(['semua', 'retur', 'rugi'] as FilterType[]).map(value => {
          const isActive = filter === value;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => handleFilterChange(value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {value === 'semua'
                  ? 'Semua'
                  : value === 'retur'
                  ? 'Retur'
                  : 'Rugi'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={history}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isRetur = item.adjustment_type === 'retur';
          const Icon = isRetur ? RotateCcw : AlertOctagon;
          const color = isRetur ? Colors.primary : '#dc2626';

          return (
            <View style={styles.card}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isRetur ? '#eff6ff' : '#fee2e2' },
                ]}
              >
                <Icon size={18} color={color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.product_name}
                </Text>
                <Text style={styles.cardDetail}>
                  {item.quantity_adjusted} unit - Exp {item.tanggal_kadaluwarsa}
                </Text>
                {item.note ? (
                  <Text style={styles.cardNote} numberOfLines={2}>
                    {item.note}
                  </Text>
                ) : null}
                <Text style={styles.cardDate}>{item.created_at}</Text>
              </View>
              <Text style={[styles.lossValue, { color }]}>
                {formatRupiah(item.estimated_loss)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Inbox size={40} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada riwayat penyesuaian</Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default RiwayatPenyesuaianScreen;
