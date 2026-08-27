import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Receipt } from 'lucide-react-native';
import { Colors } from '../../../styles';
import DateField from '../../../components/ui/DateField';
import {
  getTransactions,
  TransactionApi,
} from '../../../services/transactionService';
import { useToast } from '../../../contexts/ToastContext';
import { TransaksiStackParamList } from '../../../navigation/types';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<
  TransaksiStackParamList,
  'Transaksi'
>;
type FilterType = 'semua' | '7hari' | '30hari' | 'custom';

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

// transaction_date formatnya "DD/MM/YYYY HH:mm"
const parseTransactionDate = (dateStr: string) => {
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  return { day, month, year, time: timePart ?? '' };
};

const formatDateHeader = (dateStr: string): string => {
  const { day, month, year } = parseTransactionDate(dateStr);
  return `${day} ${INDO_MONTHS[month - 1]} ${year}`;
};

const formatDateTimeDisplay = (dateStr: string): string => {
  const { day, month, year, time } = parseTransactionDate(dateStr);
  return `${day} ${INDO_MONTHS[month - 1]} ${year} - ${time.replace(
    ':',
    '.',
  )} WIB`;
};

// DateField pakai format DD/MM/YYYY, query API butuh YYYY-MM-DD
const toQueryDate = (ddmmyyyy: string): string => {
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month}-${day}`;
};

const getDateNDaysAgo = (n: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const getTodayQueryDate = (): string => getDateNDaysAgo(0);

const RiwayatTransaksiView = () => {
  const toast = useToast();
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionApi[]>([]);
  const [filter, setFilter] = useState<FilterType>('semua');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchTransactions = useCallback(
    async (activeFilter: FilterType, start: string, end: string) => {
      setLoading(true);
      try {
        let params: { start_date?: string; end_date?: string } | undefined;

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
        } else if (activeFilter === 'custom' && start && end) {
          params = {
            start_date: toQueryDate(start),
            end_date: toQueryDate(end),
          };
        }

        const response = await getTransactions(params);
        setTransactions(response.data);
      } catch (error) {
        toast.error('Gagal memuat riwayat transaksi');
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      fetchTransactions(filter, customStart, customEnd);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]),
  );

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    if (value !== 'custom') {
      fetchTransactions(value, '', '');
    }
  };

  const handleApplyCustomRange = () => {
    if (!customStart || !customEnd) {
      toast.error('Pilih tanggal mulai dan sampai dulu');
      return;
    }
    fetchTransactions('custom', customStart, customEnd);
  };

  // Kelompokkan berturut-turut sesuai urutan dari backend (tidak diurutkan ulang)
  const sections = useMemo(() => {
    const groups: { title: string; data: TransactionApi[] }[] = [];
    transactions.forEach(trx => {
      const title = formatDateHeader(trx.transaction_date);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.title === title) {
        lastGroup.data.push(trx);
      } else {
        groups.push({ title, data: [trx] });
      }
    });
    return groups;
  }, [transactions]);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {(['semua', '7hari', '30hari'] as FilterType[]).map(value => {
          const isActive = filter === value;
          const label =
            value === 'semua'
              ? 'Semua'
              : value === '7hari'
              ? '7 hari'
              : '30 hari';
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
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'custom' && styles.filterChipActive,
          ]}
          onPress={() => setFilter('custom')}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'custom' && styles.filterChipTextActive,
            ]}
          >
            Dari - Sampai
          </Text>
        </TouchableOpacity>
      </View>

      {filter === 'custom' && (
        <View style={styles.customRangeRow}>
          <View style={styles.customRangeField}>
            <DateField
              label="Dari"
              value={customStart}
              onChange={setCustomStart}
            />
          </View>
          <View style={styles.customRangeField}>
            <DateField
              label="Sampai"
              value={customEnd}
              onChange={setCustomEnd}
            />
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyCustomRange}
          >
            <Text style={styles.applyButtonText}>Terapkan</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('DetailTransaksi', {
                  id: item.id,
                })
              }
            >
              {/* <View style={styles.card}> */}
              <View style={styles.iconCircle}>
                <Receipt size={18} color={Colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardDate}>
                  {formatDateTimeDisplay(item.transaction_date)}
                </Text>
                <Text style={styles.cardCode}>{item.transaction_code}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardAmount}>
                  {formatRupiah(item.final_amount)}
                </Text>
                <Text style={styles.cardItemCount}>
                  {item.total_quantity} item
                </Text>
              </View>
              {/* </View> */}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Receipt size={40} color="#ccc" />
              <Text style={styles.emptyText}>Belum ada transaksi</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default RiwayatTransaksiView;
