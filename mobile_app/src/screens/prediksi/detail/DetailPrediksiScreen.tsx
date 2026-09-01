import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Sparkles,
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { Colors } from '../../../styles';
import {
  getProductPredictions,
  runPrediction,
  PredictionDetailApi,
  UrgencyLevel,
} from '../../../services/predictionService';
import { useToast } from '../../../contexts/ToastContext';
import { PrediksiStackParamList } from '../../../navigation/types';
import PredictionChart from './PredictionChart';
import styles from './styles';

type RoutePropType = RouteProp<PrediksiStackParamList, 'DetailPrediksi'>;
type NavigationProp = NativeStackNavigationProp<
  PrediksiStackParamList,
  'DetailPrediksi'
>;

const screenWidth = Dimensions.get('window').width;

const getUrgencyConfig = (urgency: UrgencyLevel) => {
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
        color: '#f59e0b',
        bg: '#fef3c7',
        label: 'Perlu Diperhatikan',
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

const DetailPrediksiScreen = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavigationProp>();
  const { productId } = route.params;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [data, setData] = useState<PredictionDetailApi | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await getProductPredictions(productId);
      setData(response.data);
    } catch (error) {
      toast.error('Gagal memuat data prediksi');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleRunPrediction = async () => {
    setRunning(true);
    try {
      const response = await runPrediction(productId);
      setData(response.data);
      toast.success('Prediksi berhasil dijalankan');
    } catch (error: any) {
      const message =
        error.response?.data?.error || 'Gagal menjalankan prediksi';
      toast.error(message);
    } finally {
      setRunning(false);
    }
  };

  const handleRestock = () => {
    if (!data) return;
    // navigation.getParent()?.navigate(
    //   'DashboardTab' as never,
    //   {
    //     screen: 'TambahPembelian',
    //     params: {
    //       prefillProductId: data.product_id,
    //       prefillQuantity: Math.ceil(data.recommended_restock_quantity),
    //     },
    //   } as never,
    // );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <ScreenLayout title="Detail Prediksi" subtitle="Data tidak ditemukan">
        <Text style={styles.emptyText}>Data tidak ditemukan.</Text>
      </ScreenLayout>
    );
  }

  if (!data.has_prediction) {
    return (
      <ScreenLayout title={data.product_name} subtitle="Belum Ada Prediksi">
        <View style={styles.ctaCard}>
          <Sparkles size={40} color={Colors.primary} />
          <Text style={styles.ctaTitle}>Belum Ada Prediksi</Text>
          <Text style={styles.ctaText}>
            Jalankan prediksi AI buat lihat proyeksi penjualan & rekomendasi
            restock produk ini.
          </Text>
          <PrimaryButton
            title="Jalankan Prediksi"
            loadingTitle="Memproses..."
            loading={running}
            onPress={handleRunPrediction}
          />
        </View>
      </ScreenLayout>
    );
  }

  const config = getUrgencyConfig(data.urgency);
  const UrgencyIcon = config.icon;

  return (
    <ScreenLayout title={data.product_name} subtitle="Detail Prediksi">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.urgencyCard, { backgroundColor: config.bg }]}>
          <UrgencyIcon size={22} color={config.color} />
          <View style={styles.urgencyCardContent}>
            <Text style={[styles.urgencyCardTitle, { color: config.color }]}>
              {config.label}
            </Text>
            {data.days_remaining != null && (
              <Text style={styles.urgencyCardSubtitle}>
                Stok diperkirakan habis dalam ~{Math.round(data.days_remaining)}{' '}
                hari
              </Text>
            )}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Stok Saat Ini</Text>
            <Text style={styles.statValue}>{data.current_stock}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rata-rata Terjual</Text>
            <Text style={styles.statValue}>
              {data.average_daily_sales}/hari
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Aktual vs Prediksi</Text>
          <PredictionChart
            actual={data.chart_data.actual}
            predicted={data.chart_data.predicted}
            // width={screenWidth - 64}
          />
        </View>

        <View style={styles.restockCard}>
          <View style={styles.restockInfo}>
            <Text style={styles.restockLabel}>Rekomendasi Restock</Text>
            <Text style={styles.restockValue}>
              {data.recommended_restock_quantity} unit
            </Text>
          </View>
          <TouchableOpacity
            style={styles.restockButton}
            onPress={handleRestock}
          >
            <ShoppingCart size={16} color="#fff" />
            <Text style={styles.restockButtonText}>Restock</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.rerunButton}
          onPress={handleRunPrediction}
          disabled={running}
        >
          {running ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <RefreshCw size={16} color={Colors.primary} />
          )}
          <Text style={styles.rerunButtonText}>
            {running ? 'Memproses...' : 'Jalankan Ulang Prediksi'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
};

export default DetailPrediksiScreen;
