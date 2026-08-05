import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Package,
  Calendar,
  RotateCcw,
  AlertOctagon,
  Info,
} from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import SelectField, { SelectOption } from '../../../components/ui/SelectField';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { Colors } from '../../../styles';
import {
  createAdjustment,
  getAvailableBatches,
  getAdjustmentProducts,
  AdjustmentType,
  AvailableBatchApi,
} from '../../../services/stockAdjustmentService';
import { useToast } from '../../../contexts/ToastContext';
import { DashboardStackParamList } from '../../../navigation/types';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'TambahPenyesuaian'
>;
type RoutePropType = RouteProp<DashboardStackParamList, 'TambahPenyesuaian'>;

const formatDateToday = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${now.getFullYear()}`;
};

const TambahPenyesuaianScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const toast = useToast();

  const hasPrefill = route.params?.productId != null;

  const [loadingOptions, setLoadingOptions] = useState(!hasPrefill);
  const [resolvingBatch, setResolvingBatch] = useState(false);

  // State Produk
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    hasPrefill ? (route.params.productId as number) : null,
  );
  const [productName, setProductName] = useState(
    hasPrefill ? route.params.productName : '',
  );

  // State Batch (Ide 2)
  const [batches, setBatches] = useState<AvailableBatchApi[]>([]);
  const [batchOptions, setBatchOptions] = useState<SelectOption[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  // Form State
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('rugi');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Load semua produk (Jika tidak dari prefill)
  useEffect(() => {
    if (hasPrefill) return;
    const loadProducts = async () => {
      try {
        const response = await getAdjustmentProducts();
        setProductOptions(
          response.data.map(p => ({ label: p.name, value: p.id })),
        );
      } catch (error) {
        toast.error('Gagal memuat daftar produk');
      } finally {
        setLoadingOptions(false);
      }
    };
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Load Batch setiap kali produk dipilih
  useEffect(() => {
    if (!selectedProductId) {
      setBatches([]);
      setBatchOptions([]);
      setSelectedBatchId(null);
      return;
    }

    const loadBatches = async () => {
      setResolvingBatch(true);
      try {
        const response = await getAvailableBatches(selectedProductId);
        const data = response.data;
        if (data && data.length > 0) {
          setBatches(data);

          // Format option untuk dropdown
          const options = data.map(b => ({
            label: `Exp: ${b.tanggal_kadaluwarsa} (Sisa: ${b.quantity_remaining})`,
            value: b.purchase_item_id,
          }));
          setBatchOptions(options);

          // AUTO-SELECT LOGIC
          if (hasPrefill && route.params?.tanggalKadaluwarsa) {
            // Jika datang dari halaman Expiring, coba pilih batch dengan tanggal yang sama
            const matched = data.find(
              b => b.tanggal_kadaluwarsa === route.params.tanggalKadaluwarsa,
            );
            setSelectedBatchId(
              matched ? matched.purchase_item_id : data[0].purchase_item_id,
            );
          } else {
            // Default: Pilih batch terlama (paling atas)
            setSelectedBatchId(data[0].purchase_item_id);
          }
        } else {
          setBatches([]);
          setSelectedBatchId(null);
          Alert.alert(
            'Tidak Ada Stok',
            'Barang ini tidak memiliki stok yang bisa disesuaikan.',
          );
        }
      } catch (error: any) {
        Alert.alert(
          'Gagal',
          'Terjadi kesalahan saat memuat daftar batch stok.',
        );
      } finally {
        setResolvingBatch(false);
      }
    };

    loadBatches();
  }, [selectedProductId, hasPrefill, route.params]);

  const handleSelectProduct = (val: number | string) => {
    const pid = Number(val);
    setSelectedProductId(pid);
    const pName = productOptions.find(o => o.value === pid)?.label ?? '';
    setProductName(pName);
    setQuantity(''); // Reset qty saat produk ganti
  };

  // Helper untuk mendapatkan data batch yang sedang aktif dipilih
  const activeBatch = batches.find(b => b.purchase_item_id === selectedBatchId);

  const handleUseAllStock = () => {
    if (activeBatch) {
      setQuantity(String(activeBatch.quantity_remaining));
    }
  };

  const handleSubmit = async () => {
    if (!selectedProductId || !selectedBatchId || !activeBatch) {
      Alert.alert('Periksa Kembali', 'Pilih barang dan batch terlebih dahulu');
      return;
    }
    if (!quantity) {
      Alert.alert('Periksa Kembali', 'Jumlah wajib diisi');
      return;
    }

    const qtyNumber = parseFloat(quantity.replace(',', '.'));
    if (qtyNumber <= 0 || qtyNumber > activeBatch.quantity_remaining) {
      Alert.alert(
        'Periksa Kembali',
        `Jumlah harus antara 0,1 - ${activeBatch.quantity_remaining}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await createAdjustment({
        product_id: selectedProductId,
        purchase_item_id: selectedBatchId,
        tanggal_kadaluwarsa: activeBatch.tanggal_kadaluwarsa, // Dikirim sbg opsional metadata
        quantity: quantity.replace(',', '.'),
        adjustment_type: adjustmentType,
        note: note.trim() || undefined,
      });

      toast.success(
        `Penyesuaian tersimpan. Estimasi kerugian: Rp ${response.data.estimated_loss.toLocaleString(
          'id-ID',
        )}`,
      );
      navigation.goBack();
    } catch (error: any) {
      const message =
        error.response?.data?.error || 'Gagal menyimpan penyesuaian stok';
      Alert.alert('Gagal', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOptions) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout title="Penyesuaian Stok" subtitle="Retur / Barang Rusak">
      {/* 1. Pemilihan Produk */}
      {!hasPrefill ? (
        <SelectField
          label="Pilih Barang"
          placeholder="Cari nama barang..."
          value={selectedProductId}
          options={productOptions}
          onSelect={handleSelectProduct}
          searchable
          searchPlaceholder="Ketik nama barang..."
          leftIcon={<Package size={18} color={Colors.textSecondary} />}
        />
      ) : (
        <View style={styles.infoCard}>
          <Text style={styles.infoProductName}>{productName}</Text>
        </View>
      )}

      {/* Loading Indikator Batch */}
      {resolvingBatch && (
        <View style={styles.resolvingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.resolvingText}>Mengecek batch tersedia...</Text>
        </View>
      )}

      {/* 2. Pemilihan Batch & Banner (Hanya muncul jika batch tersedia) */}
      {!hasPrefill && !resolvingBatch && batches.length > 0 && (
        <>
          <SelectField
            label="Pilih Batch / Kadaluwarsa"
            placeholder="Pilih batch..."
            value={selectedBatchId}
            options={batchOptions}
            onSelect={val => setSelectedBatchId(Number(val))}
            leftIcon={<Calendar size={18} color={Colors.textSecondary} />}
          />

          {/* Banner Ide 2 */}
          <View style={styles.infoBanner}>
            <View style={styles.bannerHeaderRow}>
              <Info size={16} color="#137333" />
              <Text style={styles.infoBannerTitle}>Tips Pemilihan Batch</Text>
            </View>
            <Text style={styles.infoBannerText}>
              Sistem otomatis memilih barang dengan kadaluwarsa paling dekat.
              Biarkan pilihan ini jika tanggal pada kemasan rusak tidak terbaca.
            </Text>
          </View>
        </>
      )}

      <Text style={styles.fieldLabel}>Jenis Penyesuaian</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            adjustmentType === 'retur' && styles.typeButtonActive,
          ]}
          onPress={() => setAdjustmentType('retur')}
        >
          <RotateCcw
            size={18}
            color={adjustmentType === 'retur' ? '#fff' : Colors.textSecondary}
          />
          <Text
            style={[
              styles.typeButtonText,
              adjustmentType === 'retur' && styles.typeButtonTextActive,
            ]}
          >
            Retur Supplier
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            adjustmentType === 'rugi' && styles.typeButtonActiveDanger,
          ]}
          onPress={() => setAdjustmentType('rugi')}
        >
          <AlertOctagon
            size={18}
            color={adjustmentType === 'rugi' ? '#fff' : Colors.textSecondary}
          />
          <Text
            style={[
              styles.typeButtonText,
              adjustmentType === 'rugi' && styles.typeButtonTextActive,
            ]}
          >
            Barang Rusak
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldWrapper}>
        <View style={styles.quantityHeaderRow}>
          <Text style={styles.fieldLabel}>Jumlah</Text>
          {activeBatch && (
            <TouchableOpacity onPress={handleUseAllStock}>
              <Text style={styles.useAllText}>
                Pakai Semua ({activeBatch.quantity_remaining})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={styles.quantityInput}
          placeholder="0"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          editable={!!activeBatch}
        />
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>Tanggal Pencatatan</Text>
        <View style={styles.dateDisplay}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.dateDisplayText}>{formatDateToday()}</Text>
        </View>
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>Keterangan (opsional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Contoh: Kemasan rusak saat dicek"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
      </View>

      <PrimaryButton
        title="Simpan Penyesuaian"
        loadingTitle="Menyimpan..."
        loading={submitting}
        onPress={handleSubmit}
        disabled={!selectedBatchId || batches.length === 0}
      />
    </ScreenLayout>
  );
};

export default TambahPenyesuaianScreen;
