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
} from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import SelectField, { SelectOption } from '../../../components/ui/SelectField';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { Colors } from '../../../styles';
import {
  getExpiringProducts,
  createAdjustment,
  ExpiringProductApi,
  AdjustmentType,
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
  const [expiringList, setExpiringList] = useState<ExpiringProductApi[]>([]);

  const [selected, setSelected] = useState<ExpiringProductApi | null>(
    hasPrefill
      ? {
          product_id: route.params.productId as number,
          product_name: route.params.productName ?? '',
          tanggal_kadaluwarsa: route.params.tanggalKadaluwarsa ?? '',
          total_remaining: route.params.maxQuantity ?? 0,
        }
      : null,
  );

  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('rugi');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasPrefill) return;
    const loadExpiring = async () => {
      try {
        const response = await getExpiringProducts();
        setExpiringList(response.data);
      } catch (error) {
        toast.error('Gagal memuat daftar barang');
      } finally {
        setLoadingOptions(false);
      }
    };
    loadExpiring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productOptions: SelectOption[] = expiringList.map((item, index) => ({
    label: `${item.product_name} - exp ${item.tanggal_kadaluwarsa} (sisa ${item.total_remaining})`,
    value: index,
  }));

  const handleSelectProduct = (index: number | string) => {
    setSelected(expiringList[Number(index)]);
  };

  const handleSubmit = async () => {
    if (!selected) {
      Alert.alert('Periksa Kembali', 'Pilih barang terlebih dahulu');
      return;
    }
    if (!quantity) {
      Alert.alert('Periksa Kembali', 'Jumlah wajib diisi');
      return;
    }
    const qtyNumber = parseFloat(quantity);
    if (qtyNumber <= 0 || qtyNumber > selected.total_remaining) {
      Alert.alert(
        'Periksa Kembali',
        `Jumlah harus antara 0 - ${selected.total_remaining}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await createAdjustment({
        product_id: selected.product_id,
        tanggal_kadaluwarsa: selected.tanggal_kadaluwarsa,
        quantity,
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
      {!hasPrefill && (
        <SelectField
          label="Pilih Barang"
          placeholder="Pilih barang mendekati kadaluwarsa"
          value={
            selected
              ? expiringList.findIndex(
                  i =>
                    i.product_id === selected.product_id &&
                    i.tanggal_kadaluwarsa === selected.tanggal_kadaluwarsa,
                )
              : null
          }
          options={productOptions}
          onSelect={handleSelectProduct}
          leftIcon={<Package size={18} color={Colors.textSecondary} />}
        />
      )}

      {selected && (
        <View style={styles.infoCard}>
          <Text style={styles.infoProductName}>{selected.product_name}</Text>
          <View style={styles.infoRow}>
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              Kadaluwarsa: {selected.tanggal_kadaluwarsa}
            </Text>
          </View>
          <Text style={styles.infoStock}>
            Sisa stok batch ini: {selected.total_remaining}
          </Text>
        </View>
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
        <Text style={styles.fieldLabel}>Jumlah</Text>
        <TextInput
          style={styles.quantityInput}
          placeholder="0"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        {selected && (
          <Text style={styles.hintText}>
            Maksimal {selected.total_remaining}
          </Text>
        )}
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>Tanggal</Text>
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
      />
    </ScreenLayout>
  );
};

export default TambahPenyesuaianScreen;
