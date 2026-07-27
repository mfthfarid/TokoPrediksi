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
import { Plus, ShoppingBag } from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import { Colors } from '../../styles';
import { getPurchases, PurchaseApi } from '../../services/purchaseService';
import { useToast } from '../../contexts/ToastContext';
import { DashboardStackParamList } from '../../navigation/types';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'Pembelian'
>;

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const PembelianScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const [purchases, setPurchases] = useState<PurchaseApi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    try {
      const response = await getPurchases();
      setPurchases(response.data);
    } catch (error) {
      toast.error('Gagal memuat riwayat pembelian');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPurchases();
    }, [fetchPurchases]),
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
      title="Pembelian"
      subtitle="Riwayat Restok Barang"
      scrollable={false}
    >
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('TambahPembelian')}
      >
        <Plus size={18} color="#fff" />
        <Text style={styles.addButtonText}>Catat Pembelian</Text>
      </TouchableOpacity>

      <FlatList
        data={purchases}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.supplierName}>{item.supplier.name}</Text>
              <Text style={styles.purchaseDate}>{item.purchase_date}</Text>
            </View>
            <Text style={styles.itemCount}>
              {item.items.length} item barang
            </Text>
            <Text style={styles.totalAmount}>
              {formatRupiah(item.total_amount)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ShoppingBag size={40} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada riwayat pembelian</Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default PembelianScreen;
