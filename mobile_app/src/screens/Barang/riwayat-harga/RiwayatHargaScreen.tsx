import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import { Colors } from '../../../styles';
import {
  getPriceHistory,
  PriceHistoryApi,
} from '../../../services/priceHistoryService';
import { useToast } from '../../../contexts/ToastContext';
import { BarangStackParamList } from '../../../navigation/types';
import styles from './styles';

type RiwayatHargaRouteProp = RouteProp<BarangStackParamList, 'RiwayatHarga'>;

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const RiwayatHargaScreen = () => {
  const route = useRoute<RiwayatHargaRouteProp>();
  const { productId, unitId, unitName } = route.params;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PriceHistoryApi[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await getPriceHistory(productId, unitId);
      // Terbaru dulu - jaga-jaga urutan dari backend belum tentu terurut
      const sorted = [...response.data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setHistory(sorted);
    } catch (error) {
      toast.error('Gagal memuat riwayat harga');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, unitId]);

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
    <ScreenLayout title="Riwayat Harga" subtitle={unitName} scrollable={false}>
      <FlatList
        data={history}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isIncrease =
            item.old_price != null && item.new_price > item.old_price;
          const isDecrease =
            item.old_price != null && item.new_price < item.old_price;
          const TrendIcon = isIncrease
            ? TrendingUp
            : isDecrease
            ? TrendingDown
            : Minus;
          const trendColor = isIncrease
            ? '#dc2626'
            : isDecrease
            ? '#16a34a'
            : Colors.textSecondary;

          return (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <TrendIcon size={18} color={trendColor} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.priceRow}>
                  {item.old_price != null && (
                    <>
                      <Text style={styles.oldPrice}>
                        {formatRupiah(item.old_price)}
                      </Text>
                      <Text style={styles.arrow}>→</Text>
                    </>
                  )}
                  <Text style={styles.newPrice}>
                    {formatRupiah(item.new_price)}
                  </Text>
                </View>
                <Text style={styles.date}>
                  {formatDateTime(item.created_at)}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Minus size={40} color="#ccc" />
            <Text style={styles.emptyText}>
              Belum ada riwayat perubahan harga
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default RiwayatHargaScreen;
