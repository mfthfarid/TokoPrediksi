import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertTriangle, TrendingDown, CheckCircle2, HelpCircle, Sparkles, PackageSearch } from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import { Colors } from '../../styles';
import {
  getPredictionSummary,
  getReorderInfo,
  PredictionSummaryApi,
  ReorderInfoApi,
  UrgencyLevel,
} from '../../services/predictionService';
import { useToast } from '../../contexts/ToastContext';
import { PrediksiStackParamList } from '../../navigation/types';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<PrediksiStackParamList, 'Prediksi'>;

const getUrgencyConfig = (urgency: UrgencyLevel, hasPrediction: boolean) => {
  if (!hasPrediction) {
    return {
      icon: HelpCircle,
      color: '#9ca3af',
      bg: '#f3f4f6',
      label: 'Belum Diprediksi',
    };
  }
  switch (urgency) {
    case 'tinggi':
      return { icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2', label: 'Segera Restock' };
    case 'sedang':
      return { icon: TrendingDown, color: '#f59e0b', bg: '#fef3c7', label: 'Perlu Diperhatikan' };
    default:
      return { icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7', label: 'Stok Aman' };
  }
};

const PrediksiScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const [items, setItems] = useState<PredictionSummaryApi[]>([]);
  // Map productId -> ReorderInfo (null = tidak bisa dihitung / belum prediksi)
  const [reorderMap, setReorderMap] = useState<Record<number, ReorderInfoApi | null>>({});
  const [activeFilter, setActiveFilter] = useState<
    'default' | 'tinggi' | 'sedang' | 'rendah' | 'belum' | 'semua'
  >('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await getPredictionSummary();
      const summaryItems = response.data;
      setItems(summaryItems);

      // Fetch reorder-info paralel hanya untuk produk yang sudah punya prediksi
      const withPrediction = summaryItems.filter(i => i.has_prediction);
      const results = await Promise.allSettled(
        withPrediction.map(i => getReorderInfo(i.product_id)),
      );

      const map: Record<number, ReorderInfoApi | null> = {};
      withPrediction.forEach((item, idx) => {
        const result = results[idx];
        map[item.product_id] =
          result.status === 'fulfilled' ? result.value.data : null;
      });
      setReorderMap(map);
    } catch (error) {
      toast.error('Gagal memuat ringkasan prediksi');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary]),
  );

  const summaryStats = useMemo(() => {
    const tinggi = items.filter(i => i.has_prediction && i.urgency === 'tinggi').length;
    const sedang = items.filter(i => i.has_prediction && i.urgency === 'sedang').length;
    const rendah = items.filter(i => i.has_prediction && i.urgency === 'rendah').length;
    const belum = items.filter(i => !i.has_prediction).length;
    return { tinggi, sedang, rendah, belum, semua: items.length };
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (activeFilter === 'default') {
      result = items.filter(
        i => i.has_prediction && (i.urgency === 'tinggi' || i.urgency === 'sedang'),
      );
    } else if (activeFilter === 'tinggi' || activeFilter === 'sedang' || activeFilter === 'rendah') {
      result = items.filter(i => i.has_prediction && i.urgency === activeFilter);
    } else if (activeFilter === 'belum') {
      result = items.filter(i => !i.has_prediction);
    }
    // 'semua' -> tidak difilter sama sekali

    if (searchQuery.trim()) {
      result = result.filter(i =>
        i.product_name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      );
    }

    return result;
  }, [items, activeFilter, searchQuery]);

  const filterLabel = {
    default: 'Perlu Perhatian',
    tinggi: 'Segera Restock',
    sedang: 'Perlu Diperhatikan',
    rendah: 'Stok Aman',
    belum: 'Belum Diprediksi',
    semua: 'Semua Produk',
  }[activeFilter];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout title="Prediksi" subtitle="Rekomendasi Restock" scrollable={false}>
      <FlatList
        data={filteredItems}
        keyExtractor={item => String(item.product_id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeaderRow}>
              <Sparkles size={18} color={Colors.primary} />
              <Text style={styles.summaryTitle}>Ringkasan Prediksi</Text>
            </View>

            {summaryStats.tinggi > 0 ? (
              <Text style={styles.summaryHighlight}>
                {summaryStats.tinggi} produk perlu segera direstock
              </Text>
            ) : (
              <Text style={styles.summaryHighlightSafe}>
                Semua stok masih aman minggu ini 🎉
              </Text>
            )}

            <View style={styles.summaryStatsRow}>
              <TouchableOpacity
                style={[
                  styles.summaryStatBox,
                  activeFilter === 'tinggi' && styles.summaryStatBoxActive,
                ]}
                onPress={() => setActiveFilter('tinggi')}
              >
                <Text style={[styles.summaryStatValue, { color: '#dc2626' }]}>
                  {summaryStats.tinggi}
                </Text>
                <Text style={styles.summaryStatLabel}>Segera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.summaryStatBox,
                  activeFilter === 'sedang' && styles.summaryStatBoxActive,
                ]}
                onPress={() => setActiveFilter('sedang')}
              >
                <Text style={[styles.summaryStatValue, { color: '#f59e0b' }]}>
                  {summaryStats.sedang}
                </Text>
                <Text style={styles.summaryStatLabel}>Perhatikan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.summaryStatBox,
                  activeFilter === 'rendah' && styles.summaryStatBoxActive,
                ]}
                onPress={() => setActiveFilter('rendah')}
              >
                <Text style={[styles.summaryStatValue, { color: '#16a34a' }]}>
                  {summaryStats.rendah}
                </Text>
                <Text style={styles.summaryStatLabel}>Aman</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.summaryStatBox,
                  activeFilter === 'belum' && styles.summaryStatBoxActive,
                ]}
                onPress={() => setActiveFilter('belum')}
              >
                <Text style={[styles.summaryStatValue, { color: '#9ca3af' }]}>
                  {summaryStats.belum}
                </Text>
                <Text style={styles.summaryStatLabel}>Belum</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.summaryStatBox,
                  activeFilter === 'semua' && styles.summaryStatBoxActive,
                ]}
                onPress={() => setActiveFilter('semua')}
              >
                <Text style={[styles.summaryStatValue, { color: Colors.text }]}>
                  {summaryStats.semua}
                </Text>
                <Text style={styles.summaryStatLabel}>Semua</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama barang..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={styles.filterLabel}>
            Menampilkan: <Text style={styles.filterLabelBold}>{filterLabel}</Text>
          </Text>
        </>
      }
      renderItem={({ item }) => {
          const config = getUrgencyConfig(item.urgency, item.has_prediction);
          const Icon = config.icon;
          const reorderInfo = reorderMap[item.product_id];
          const needsReorder = reorderInfo?.needs_reorder === true;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('DetailPrediksi', { productId: item.product_id })
              }
            >
              <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                <Icon size={20} color={config.color} />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.product_name}
                </Text>
                <Text style={styles.stockText}>
                  Stok: {item.current_stock_display ?? item.current_stock} • Terjual {item.average_daily_sales_display ?? item.average_daily_sales}/hari
                </Text>
              </View>

              <View style={styles.cardRight}>
                {/* Badge Reorder Point — ditampilkan jika needs_reorder=true */}
                {needsReorder && (
                  <View style={styles.reorderBadge}>
                    <PackageSearch size={10} color="#fff" />
                    <Text style={styles.reorderBadgeText}>Reorder!</Text>
                  </View>
                )}
                <View style={[styles.urgencyBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.urgencyBadgeText, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>
                {item.days_remaining != null && (
                  <Text style={styles.daysText}>
                    Habis ~{Math.round(item.days_remaining)} hari
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Belum ada data produk</Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default PrediksiScreen;