import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { Receipt, Calendar, Tag } from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import { Colors } from '../../../styles';
import {
  getTransactionById,
  TransactionApi,
} from '../../../services/transactionService';
import { useToast } from '../../../contexts/ToastContext';
import { TransaksiStackParamList } from '../../../navigation/types';
import styles from './styles';

type RoutePropType = RouteProp<TransaksiStackParamList, 'DetailTransaksi'>;

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const DetailTransaksiScreen = () => {
  const route = useRoute<RoutePropType>();
  const { id } = route.params;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionApi | null>(null);

  const fetchTransaction = useCallback(async () => {
    try {
      const response = await getTransactionById(id);
      setTransaction(response.data);
    } catch (error) {
      toast.error('Gagal memuat detail transaksi');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchTransaction();
    }, [fetchTransaction]),
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <ScreenLayout title="Detail Transaksi" subtitle="Data tidak ditemukan">
        <Text style={styles.emptyText}>Transaksi tidak ditemukan.</Text>
      </ScreenLayout>
    );
  }

  const discountAmount = transaction.total_amount - transaction.final_amount;

  return (
    <ScreenLayout
      title={transaction.transaction_code}
      subtitle="Detail Transaksi"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Receipt size={22} color={Colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerCode}>
              {transaction.transaction_code}
            </Text>
            <View style={styles.headerDateRow}>
              <Calendar size={12} color={Colors.textSecondary} />
              <Text style={styles.headerDateText}>
                {transaction.transaction_date}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Item Dibeli ({transaction.items.length})
        </Text>

        {transaction.items.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.product.name}
            </Text>
            <View style={styles.itemDetailRow}>
              <Text style={styles.itemDetailText}>
                {item.quantity} {item.product_unit.unit.name} ×{' '}
                {formatRupiah(item.price_at_sale)}
              </Text>
              <Text style={styles.itemSubtotal}>
                {formatRupiah(item.subtotal)}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatRupiah(transaction.total_amount)}
            </Text>
          </View>

          {transaction.discount_type && discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.discountLabelRow}>
                <Tag size={12} color="#16a34a" />
                <Text style={styles.summaryLabel}>
                  Diskon{' '}
                  {transaction.discount_type === 'percentage'
                    ? `(${transaction.discount_value}%)`
                    : ''}
                </Text>
              </View>
              <Text style={styles.discountValue}>
                -{formatRupiah(discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatRupiah(transaction.final_amount)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default DetailTransaksiScreen;
