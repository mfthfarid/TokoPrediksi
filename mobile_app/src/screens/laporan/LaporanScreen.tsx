import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../styles';
import DateField from '../../components/ui/DateField';
import {
  getProfitReport,
  ProductProfit,
  ProfitReportResponse,
} from '../../services/reportService';
import { useToast } from '../../contexts/ToastContext';
import ScreenLayout from '../../layouts/ScreenLayout';
import { Styles } from './styles';

type FilterType = '7hari' | '30hari' | 'bulanini' | 'custom';
const INDO_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const formatNumber = (value: number): string =>
  value.toLocaleString('id-ID', {
    maximumFractionDigits: 2,
  });

const formatPercent = (value: number): string =>
  `${Math.abs(value).toLocaleString('id-ID', {
    maximumFractionDigits: 1,
  })}%`;

const getDateNDaysAgo = (n: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};

const getTodayQueryDate = (): string => getDateNDaysAgo(0);

const getFirstDayOfMonth = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}-01`;
};

// DateField DD/MM/YYYY → API YYYY-MM-DD
const toQueryDate = (ddmmyyyy: string): string => {
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month}-${day}`;
};

// API YYYY-MM-DD → tampilan DD/MM/YYYY
const toDateFieldValue = (yyyyMMdd: string): string => {
  const [year, month, day] = yyyyMMdd.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateDisplay = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  return `${day} ${INDO_MONTHS[month - 1]} ${year}`;
};

const LaporanScreen = () => {
  const toast = useToast();
  const [report, setReport] = useState<ProfitReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('bulanini');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchReport = useCallback(
    async (activeFilter: FilterType, start: string, end: string) => {
      setLoading(true);
      try {
        let params: {
          start_date: string;
          end_date: string;
        };
        if (activeFilter === '7hari') {
          params = {
            start_date: getDateNDaysAgo(7),
            end_date: getTodayQueryDate(),
          };
        } else if (activeFilter === '30hari') {
          params = {
            start_date: getDateNDaysAgo(30),
            end_date: getTodayQueryDate(),
          };
        } else if (activeFilter === 'bulanini') {
          params = {
            start_date: getFirstDayOfMonth(),
            end_date: getTodayQueryDate(),
          };
        } else if (activeFilter === 'custom' && start && end) {
          params = {
            start_date: toQueryDate(start),
            end_date: toQueryDate(end),
          };
        } else {
          return;
        }

        const response = await getProfitReport(params);
        setReport(response.data);
      } catch (error) {
        console.error('Gagal mengambil laporan:', error);
        toast.error('Gagal memuat laporan');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useFocusEffect(
    useCallback(() => {
      fetchReport(filter, customStart, customEnd);
    }, [filter]),
  );

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    if (value !== 'custom') {
      fetchReport(value, '', '');
    }
  };

  const handleApplyCustomRange = () => {
    if (!customStart || !customEnd) {
      toast.error('Pilih tanggal mulai dan sampai dulu');
      return;
    }
    const start = toQueryDate(customStart);
    const end = toQueryDate(customEnd);

    if (start > end) {
      toast.error('Tanggal mulai tidak boleh setelah tanggal akhir');
      return;
    }
    fetchReport('custom', customStart, customEnd);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReport(filter, customStart, customEnd);
  };

  const getComparisonColor = (value: number) => {
    if (value > 0) {
      return '#16A34A';
    }

    if (value < 0) {
      return '#DC2626';
    }

    return '#9CA3AF';
  };

  const getComparisonIcon = (value: number) => {
    if (value > 0) {
      return 'arrow-up';
    }

    if (value < 0) {
      return 'arrow-down';
    }

    return 'minus';
  };

  const renderComparison = (value: number) => {
    const color = getComparisonColor(value);
    return (
      <View style={Styles.comparisonContainer}>
        <Icon name={getComparisonIcon(value)} size={14} color={color} />
        <Text style={[Styles.comparisonText, { color }]}>
          {formatPercent(value)}
        </Text>
        <Text style={Styles.comparisonLabel}>dari periode sebelumnya</Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (!report) {
      return null;
    }
    const total = report.grand_total;
    return (
      <View style={Styles.headerContent}>
        {/* FILTER */}
        <View style={Styles.filterRow}>
          {(['7hari', '30hari', 'bulanini'] as FilterType[]).map(value => {
            const isActive = filter === value;
            const label =
              value === '7hari'
                ? '7 hari'
                : value === '30hari'
                ? '30 hari'
                : 'Bulan ini';
            return (
              <TouchableOpacity
                key={value}
                style={[Styles.filterChip, isActive && Styles.filterChipActive]}
                onPress={() => handleFilterChange(value)}
              >
                <Text
                  style={[
                    Styles.filterChipText,
                    isActive && Styles.filterChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[
              Styles.filterChip,
              filter === 'custom' && Styles.filterChipActive,
            ]}
            onPress={() => setFilter('custom')}
          >
            <Text
              style={[
                Styles.filterChipText,
                filter === 'custom' && Styles.filterChipTextActive,
              ]}
            >
              Dari - Sampai
            </Text>
          </TouchableOpacity>
        </View>

        {/* CUSTOM DATE */}
        {filter === 'custom' && (
          <View style={Styles.customRangeRow}>
            <View style={Styles.customRangeField}>
              <DateField
                label="Dari"
                value={customStart}
                onChange={setCustomStart}
              />
            </View>
            <View style={Styles.customRangeField}>
              <DateField
                label="Sampai"
                value={customEnd}
                onChange={setCustomEnd}
              />
            </View>
            <TouchableOpacity
              style={Styles.applyButton}
              onPress={handleApplyCustomRange}
            >
              <Text style={Styles.applyButtonText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PERIODE AKTIF */}
        <View style={Styles.periodInfo}>
          <Icon
            name="calendar-month-outline"
            size={18}
            color={Colors.primary}
          />
          <Text style={Styles.periodText}>
            {formatDateDisplay(report.start_date)} -{' '}
            {formatDateDisplay(report.end_date)}
          </Text>
        </View>

        {/* TOTAL PENJUALAN */}
        <View style={Styles.summaryCard}>
          <Text style={Styles.summaryLabel}>Total Penjualan</Text>
          <Text style={Styles.summaryRevenue}>
            {formatRupiah(total.total_revenue)}
          </Text>
          {renderComparison(report.comparison.revenue_change_percent)}
        </View>

        {/* PROFIT + MARGIN */}
        <View style={Styles.twoColumnRow}>
          <View style={Styles.smallSummaryCard}>
            <View style={Styles.cardIconContainer}>
              <Icon name="cash-plus" size={20} color="#16A34A" />
            </View>
            <Text style={Styles.smallCardLabel}>Keuntungan</Text>
            <Text style={Styles.profitValue}>
              {formatRupiah(total.total_profit)}
            </Text>
            {renderComparison(report.comparison.profit_change_percent)}
          </View>
          <View style={Styles.smallSummaryCard}>
            <View style={Styles.cardIconContainer}>
              <Icon name="chart-donut" size={20} color={Colors.primary} />
            </View>
            <Text style={Styles.smallCardLabel}>Margin Keuntungan</Text>
            <Text style={Styles.marginValue}>
              {formatPercent(total.profit_margin)}
            </Text>
            <Text style={Styles.marginDescription}>dari total penjualan</Text>
          </View>
        </View>

        {/* AKTIVITAS */}
        <View style={Styles.activityCard}>
          <View style={Styles.activityItem}>
            <View style={Styles.activityIcon}>
              <Icon
                name="receipt-text-outline"
                size={20}
                color={Colors.primary}
              />
            </View>
            <View>
              <Text style={Styles.activityValue}>
                {formatNumber(total.total_transactions)}
              </Text>
              <Text style={Styles.activityLabel}>Transaksi</Text>
            </View>
          </View>
          <View style={Styles.activityDivider} />
          <View style={Styles.activityItem}>
            <View style={Styles.activityIcon}>
              <Icon
                name="package-variant-closed"
                size={20}
                color={Colors.primary}
              />
            </View>
            <View>
              <Text style={Styles.activityValue}>
                {formatNumber(total.total_items_sold)}
              </Text>
              <Text style={Styles.activityLabel}>Item Terjual</Text>
            </View>
          </View>
        </View>

        {/* SECTION TITLE */}
        <View style={Styles.sectionHeader}>
          <Text style={Styles.sectionTitle}>Laporan Produk</Text>
          <Text style={Styles.sectionSubtitle}>
            Penjualan dan keuntungan per produk
          </Text>
        </View>
      </View>
    );
  };

  const renderProduct = ({ item }: { item: ProductProfit }) => {
    return (
      <View style={Styles.productCard}>
        <View style={Styles.productHeader}>
          <View style={Styles.productIcon}>
            <Icon name="package-variant" size={21} color={Colors.primary} />
          </View>
          <View style={Styles.productTitleContainer}>
            <Text style={Styles.productName} numberOfLines={2}>
              {item.product_name}
            </Text>
            <Text style={Styles.productQuantity}>
              {formatNumber(item.total_qty_sold)} terjual
            </Text>
          </View>
          <View style={Styles.marginBadge}>
            <Text style={Styles.marginBadgeText}>
              {formatPercent(item.profit_margin)}
            </Text>
          </View>
        </View>
        <View style={Styles.productDivider} />
        <View style={Styles.productStats}>
          <View style={Styles.productStat}>
            <Text style={Styles.productStatLabel}>Penjualan</Text>
            <Text style={Styles.productStatValue}>
              {formatRupiah(item.total_revenue)}
            </Text>
          </View>
          <View style={Styles.productStat}>
            <Text style={Styles.productStatLabel}>Modal</Text>
            <Text style={Styles.productStatValue}>
              {formatRupiah(item.total_cost)}
            </Text>
          </View>
          <View style={Styles.productStat}>
            <Text style={Styles.productStatLabel}>Keuntungan</Text>
            <Text style={[Styles.productStatValue, Styles.productProfit]}>
              {formatRupiah(item.total_profit)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenLayout title="Laporan" scrollable={false}>
        <View style={Styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={Styles.loadingText}>Memuat laporan...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Laporan" scrollable={false} paddingVertical={0}>
      <FlatList
        data={report?.products ?? []}
        keyExtractor={(item, index) =>
          item.product_id
            ? String(item.product_id)
            : `${item.product_name}-${index}`
        }
        renderItem={renderProduct}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={Styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={Styles.emptyContainer}>
            <View style={Styles.emptyIconContainer}>
              <Icon name="file-chart-outline" size={42} color="#9CA3AF" />
            </View>
            <Text style={Styles.emptyTitle}>Belum Ada Data Laporan</Text>
            <Text style={Styles.emptyDescription}>
              Belum ada transaksi penjualan pada periode yang dipilih.
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default LaporanScreen;
