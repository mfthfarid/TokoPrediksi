import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import {
  Truck,
  Phone,
  MapPin,
  Calendar,
  Trash2,
  Package,
} from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import { Colors } from '../../../styles';
import { getPurchases, PurchaseApi } from '../../../services/purchaseService';
import { useToast } from '../../../contexts/ToastContext';
import { DashboardStackParamList } from '../../../navigation/types';
import styles from './styles';

type DetailRouteProp = RouteProp<DashboardStackParamList, 'DetailPembelian'>;

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const DetailPembelianScreen = () => {
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState<PurchaseApi | null>(null);

  const fetchPurchase = useCallback(async () => {
    try {
      // Belum ada GET /api/purchases/:id, jadi ambil semua lalu cari
      // sendiri berdasarkan id. Kalau nanti endpoint by-id sudah ada,
      // ini bisa diganti jadi lebih efisien.
      const response = await getPurchases();
      const found = response.data.find(p => p.id === id);
      if (!found) {
        toast.error('Data pembelian tidak ditemukan');
      }
      setPurchase(found ?? null);
    } catch (error) {
      toast.error('Gagal memuat detail pembelian');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchPurchase();
    }, [fetchPurchase]),
  );

  const handleDelete = () => {
    // TODO: sambungkan begitu DELETE /api/purchases/:id sudah tersedia
    // di backend (termasuk rollback stok/quantity_remaining).
    Alert.alert(
      'Belum Tersedia',
      'Fitur hapus riwayat pembelian masih dalam pengembangan.',
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!purchase) {
    return (
      <ScreenLayout title="Detail Pembelian" subtitle="Data tidak ditemukan">
        <Text style={styles.emptyText}>Data pembelian tidak ditemukan.</Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Detail Pembelian" subtitle={purchase.purchase_date}>
      <View style={styles.card}>
        <View style={styles.supplierRow}>
          <View style={styles.supplierIcon}>
            <Truck size={20} color={Colors.primary} />
          </View>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{purchase.supplier.name}</Text>
            {purchase.supplier.phone && (
              <View style={styles.supplierDetailRow}>
                <Phone size={12} color={Colors.textSecondary} />
                <Text style={styles.supplierDetailText}>
                  {purchase.supplier.phone}
                </Text>
              </View>
            )}
            {purchase.supplier.address && (
              <View style={styles.supplierDetailRow}>
                <MapPin size={12} color={Colors.textSecondary} />
                <Text style={styles.supplierDetailText}>
                  {purchase.supplier.address}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.supplierDetailRow}>
          <Calendar size={12} color={Colors.textSecondary} />
          <Text style={styles.supplierDetailText}>
            Tanggal Pembelian: {purchase.purchase_date}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Item Barang ({purchase.items.length})
      </Text>

      {purchase.items.map(item => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Package size={16} color={Colors.primary} />
            <Text style={styles.itemName} numberOfLines={1}>
              {item.product.name}
            </Text>
          </View>

          <View style={styles.itemDetailRow}>
            <Text style={styles.itemDetailLabel}>Satuan</Text>
            <Text style={styles.itemDetailValue}>
              {item.quantity} {item.product_unit.unit.name}
            </Text>
          </View>
          <View style={styles.itemDetailRow}>
            <Text style={styles.itemDetailLabel}>Harga Per Satuan</Text>
            <Text style={styles.itemDetailValue}>
              {formatRupiah(item.purchase_price)}
            </Text>
          </View>
          {item.tanggal_kadaluwarsa && (
            <View style={styles.itemDetailRow}>
              <Text style={styles.itemDetailLabel}>Kadaluwarsa</Text>
              <Text style={styles.itemDetailValue}>
                {item.tanggal_kadaluwarsa}
              </Text>
            </View>
          )}
          <View style={styles.itemSubtotalRow}>
            <Text style={styles.itemSubtotalLabel}>Subtotal</Text>
            <Text style={styles.itemSubtotalValue}>
              {formatRupiah(item.subtotal)}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Pembelian</Text>
        <Text style={styles.totalValue}>
          {formatRupiah(purchase.total_amount)}
        </Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Trash2 size={16} color="#dc2626" />
        <Text style={styles.deleteButtonText}>Hapus Riwayat Pembelian</Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
};

export default DetailPembelianScreen;
