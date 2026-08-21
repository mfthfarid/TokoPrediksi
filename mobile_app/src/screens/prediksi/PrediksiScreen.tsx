import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  HelpCircle,
  Package,
} from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import { Colors } from '../../styles';
import {
  getPredictionSummary,
  PredictionSummaryApi,
  UrgencyLevel,
} from '../../services/predictionService';
import { useToast } from '../../contexts/ToastContext';
import { PrediksiStackParamList } from '../../navigation/types';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<
  PrediksiStackParamList,
  'Prediksi'
>;

const getUrgencyConfig = (urgency: UrgencyLevel, hasPrediction: boolean) => {
  if (!hasPrediction) {
    return {
      icon: HelpCircle,
      color: '#6b7280',
      bg: '#f3f4f6',
      label: 'Belum Diprediksi',
    };
  }
  switch (urgency) {
    case 'tinggi':
      return {
        icon: AlertTriangle,
        color: '#dc2626',
        bg: '#fee2e2',
        label: 'Segera Restock',
      };
    case 'sedang':
      return {
        icon: TrendingDown,
        color: '#d97706',
        bg: '#fef3c7',
        label: 'Perhatian',
      };
    default:
      return {
        icon: CheckCircle2,
        color: '#16a34a',
        bg: '#dcfce7',
        label: 'Stok Aman',
      };
  }
};

const PrediksiScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const [items, setItems] = useState<PredictionSummaryApi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await getPredictionSummary();
      setItems(response.data);
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
    const tinggi = items.filter(
      i => i.has_prediction && i.urgency === 'tinggi',
    ).length;
    const sedang = items.filter(
      i => i.has_prediction && i.urgency === 'sedang',
    ).length;
    const rendah = items.filter(
      i => i.has_prediction && i.urgency === 'rendah',
    ).length;
    return { tinggi, sedang, rendah };
  }, [items]);

  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryBox, styles.summaryDanger]}>
        <Text style={styles.summaryValue}>{summaryStats.tinggi}</Text>
        <Text style={styles.summaryLabel}>Kritis</Text>
      </View>
      <View style={[styles.summaryBox, styles.summaryWarning]}>
        <Text style={styles.summaryValue}>{summaryStats.sedang}</Text>
        <Text style={styles.summaryLabel}>Waspada</Text>
      </View>
      <View style={[styles.summaryBox, styles.summarySafe]}>
        <Text style={styles.summaryValue}>{summaryStats.rendah}</Text>
        <Text style={styles.summaryLabel}>Aman</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout title="Prediksi" scrollable={false} paddingVertical={0}>
      <FlatList
        data={items}
        keyExtractor={item => String(item.product_id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={items.length > 0 ? renderHeader : null}
        renderItem={({ item }) => {
          const config = getUrgencyConfig(item.urgency, item.has_prediction);
          const Icon = config.icon;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('DetailPrediksi', {
                  productId: item.product_id,
                })
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.productInfo}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: config.bg }]}
                  >
                    <Icon size={20} color={config.color} />
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.product_name}
                  </Text>
                </View>
                <View
                  style={[styles.urgencyBadge, { backgroundColor: config.bg }]}
                >
                  <Text
                    style={[styles.urgencyBadgeText, { color: config.color }]}
                  >
                    {config.label}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Stok Saat Ini</Text>
                  <Text style={styles.metricValue}>{item.current_stock}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Rata-rata Terjual</Text>
                  <Text style={styles.metricValue}>
                    {item.average_daily_sales}/hari
                  </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Estimasi Habis</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      item.days_remaining && item.days_remaining <= 7
                        ? styles.textDanger
                        : null,
                    ]}
                  >
                    {item.days_remaining != null
                      ? `~${Math.round(item.days_remaining)} hari`
                      : '-'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package
              size={48}
              color={Colors.border}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyText}>Belum ada data produk</Text>
            <Text style={styles.emptySubtext}>
              Data prediksi akan muncul di sini
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default PrediksiScreen;
