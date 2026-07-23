import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Package,
  Tag,
  Barcode,
  Plus,
  Trash2,
  Camera as CameraIcon,
  Info,
} from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import TextField from '../../../components/ui/TextField';
import CurrencyField from '../../../components/ui/CurrencyField/CurrencyField';
import SelectField, { SelectOption } from '../../../components/ui/SelectField';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import BarcodeScannerModal from '../../../components/common/BarcodeScannerModal';
import PhotoPicker from '../../../components/common/PhotoPicker';
import { Colors } from '../../../styles';
import { getCategories } from '../../../services/categoryService';
import { getUnits } from '../../../services/unitService';
import {
  addProduct,
  uploadProductPhoto,
} from '../../../services/productService';
import { BarangStackParamList } from '../../../navigation/types';
import { useToast } from '../../../contexts/ToastContext';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<
  BarangStackParamList,
  'TambahBarang'
>;

interface UnitRow {
  key: string;
  unitId: number | null;
  conversionToBase: string;
  sellPrice: string;
  barcode: string;
  isBaseUnit: boolean;
}

const createEmptyRow = (isBaseUnit = false): UnitRow => ({
  key: Math.random().toString(36).slice(2),
  unitId: null,
  conversionToBase: isBaseUnit ? '1' : '',
  sellPrice: '',
  barcode: '',
  isBaseUnit,
});

const TambahBarangScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([]);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [unitRows, setUnitRows] = useState<UnitRow[]>([createEmptyRow(true)]);
  const [submitting, setSubmitting] = useState(false);
  const [scanningRowKey, setScanningRowKey] = useState<string | null>(null);

  const handleOpenScanner = async (rowKey: string) => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Izin Kamera',
          message: 'Aplikasi butuh akses kamera untuk scan barcode.',
          buttonPositive: 'Izinkan',
          buttonNegative: 'Batal',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Izin Ditolak',
          'Aktifkan izin kamera di pengaturan HP untuk pakai fitur scan.',
        );
        return;
      }
    }
    setScanningRowKey(rowKey);
  };

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesRes, unitsRes] = await Promise.all([
          getCategories(),
          getUnits(),
        ]);
        setCategoryOptions(
          categoriesRes.data.map(c => ({ label: c.name, value: c.id })),
        );
        setUnitOptions(
          unitsRes.data.map(u => ({ label: u.name, value: u.id })),
        );
      } catch (error) {
        Alert.alert(
          'Gagal Memuat',
          'Kategori/satuan gagal dimuat. Coba kembali dan buka lagi halaman ini.',
        );
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const updateRow = (key: string, patch: Partial<UnitRow>) => {
    setUnitRows(rows =>
      rows.map(row => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleAddRow = () => {
    setUnitRows(rows => [...rows, createEmptyRow(false)]);
  };

  const handleRemoveRow = (key: string) => {
    setUnitRows(rows => {
      if (rows.length === 1) {
        Alert.alert('Tidak Bisa', 'Minimal harus ada 1 satuan.');
        return rows;
      }
      const target = rows.find(r => r.key === key);
      const remaining = rows.filter(r => r.key !== key);

      if (target?.isBaseUnit && remaining.length > 0) {
        remaining[0] = {
          ...remaining[0],
          isBaseUnit: true,
          conversionToBase: '1',
        };
      }
      return remaining;
    });
  };

  const handleSetBaseUnit = (key: string) => {
    setUnitRows(rows =>
      rows.map(row => ({
        ...row,
        isBaseUnit: row.key === key,
        conversionToBase: row.key === key ? '1' : row.conversionToBase,
      })),
    );
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Nama barang wajib diisi';
    if (!categoryId) return 'Kategori wajib dipilih';

    for (const row of unitRows) {
      if (!row.unitId) return 'Semua satuan wajib dipilih';
      if (!row.isBaseUnit && !row.conversionToBase) {
        return 'Konversi ke satuan dasar wajib diisi untuk satuan non-dasar';
      }
    }

    const unitIds = unitRows.map(r => r.unitId);
    if (new Set(unitIds).size !== unitIds.length) {
      return 'Ada satuan yang dipilih dobel, tiap satuan hanya boleh muncul sekali';
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Periksa Kembali', validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await addProduct({
        name: name.trim(),
        id_kategori: categoryId as number,
        units: unitRows.map(row => ({
          unit_id: row.unitId as number,
          conversion_to_base: row.conversionToBase,
          sell_price: row.sellPrice ? Number(row.sellPrice) : undefined,
          barcode: row.barcode || undefined,
          is_base_unit: row.isBaseUnit,
        })),
      });

      const newProductId = response.data.id;

      // Upload foto terpisah, SETELAH produk punya id.
      // Kalau gagal, produk tetap tersimpan - jangan bikin user
      // mengira seluruh proses gagal.
      if (photoUri) {
        try {
          await uploadProductPhoto(newProductId, photoUri);
        } catch (photoError: any) {
          console.error(
            'Upload Photo Error:',
            photoError?.message || photoError,
          );
          toast.error('Barang tersimpan, tapi foto gagal diupload');
          navigation.goBack();
          return;
        }
      }

      toast.success('Barang baru berhasil ditambahkan');
      navigation.goBack();
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Gagal menambahkan barang.';
      Alert.alert('Gagal', message);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper untuk mendapatkan nama satuan di row yang sedang dirender
  const getUnitName = (unitId: number | null) => {
    return unitOptions.find(o => o.value === unitId)?.label || 'Satuan';
  };

  if (loadingOptions) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout title="Tambah Barang" subtitle="Isi data barang baru">
      {/* card informasi */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Info size={18} color={Colors.primary} />
          <Text style={styles.infoCardTitle}>Panduan Pengisian</Text>
        </View>
        <View style={styles.infoCardList}>
          <Text style={styles.infoCardItem}>
            • <Text style={styles.boldText}>Harga Modal:</Text> Ditentukan
            otomatis dari transaksi pembelian/restok, tidak diisi di sini.
          </Text>
          <Text style={styles.infoCardItem}>
            • <Text style={styles.boldText}>Harga Jual:</Text> Boleh dikosongkan
            dulu jika barang baru, dapat diubah nanti di menu Edit Barang.
          </Text>
          <Text style={styles.infoCardItem}>
            • <Text style={styles.boldText}>Satuan Dasar:</Text> Gunakan satuan
            penjualan terendah (contoh: Pcs, Bungkus).
          </Text>
          <Text style={styles.infoCardItem}>
            • <Text style={styles.boldText}>Barcode:</Text> Boleh dikosongkan
            jika produk tidak memiliki kode barang.
          </Text>
        </View>
      </View>

      <View style={styles.basicInfoCard}>
        <PhotoPicker value={photoUri} onChange={setPhotoUri} />

        <TextField
          label="Nama Barang"
          placeholder="Ketikan nama barang"
          value={name}
          onChangeText={setName}
          leftIcon={<Package size={20} color={Colors.textSecondary} />}
        />
        <SelectField
          label="Kategori Barang"
          placeholder="Pilih Kategori"
          value={categoryId}
          options={categoryOptions}
          onSelect={value => setCategoryId(Number(value))}
          leftIcon={<Tag size={18} color={Colors.textSecondary} />}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Satuan & Harga Jual</Text>
        <TouchableOpacity style={styles.addRowButton} onPress={handleAddRow}>
          <Plus size={16} color={Colors.primary} />
          <Text style={styles.addRowButtonText}>Tambah Satuan</Text>
        </TouchableOpacity>
      </View>

      {unitRows.map((row, index) => {
        const currentUnitName = getUnitName(row.unitId);

        return (
          <View key={row.key} style={styles.unitCard}>
            <View style={styles.unitCardHeader}>
              <TouchableOpacity
                style={styles.baseUnitToggle}
                onPress={() => handleSetBaseUnit(row.key)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    row.isBaseUnit && styles.radioOuterActive,
                  ]}
                >
                  {row.isBaseUnit && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.baseUnitLabel}>
                  {row.isBaseUnit ? 'Satuan Dasar' : 'Jadikan Satuan Dasar'}
                </Text>
              </TouchableOpacity>

              {unitRows.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveRow(row.key)}>
                  <Trash2 size={18} color="#dc2626" />
                </TouchableOpacity>
              )}
            </View>

            <SelectField
              label={`Satuan ${index + 1}`}
              placeholder="Pilih Satuan"
              value={row.unitId}
              options={unitOptions}
              onSelect={value => updateRow(row.key, { unitId: Number(value) })}
            />

            <View style={styles.rowInline}>
              <View style={styles.rowInlineItem}>
                <TextField
                  label={
                    row.isBaseUnit
                      ? 'Satuan Dasar'
                      : `Isi Dalam 1 ${currentUnitName}`
                  }
                  placeholder={row.isBaseUnit ? '1' : 'Contoh: 12'}
                  value={row.conversionToBase}
                  onChangeText={v =>
                    updateRow(row.key, { conversionToBase: v })
                  }
                  keyboardType="numeric"
                  editable={!row.isBaseUnit}
                />
              </View>
              <View style={styles.rowInlineItem}>
                <CurrencyField
                  label="Harga Jual"
                  placeholder="0"
                  value={row.sellPrice}
                  onChangeValue={v => updateRow(row.key, { sellPrice: v })}
                />
              </View>
            </View>

            <View style={styles.barcodeRow}>
              <View style={styles.barcodeInput}>
                <TextField
                  label="Barcode"
                  placeholder="Scan / Ketik Barcode"
                  value={row.barcode}
                  onChangeText={v => updateRow(row.key, { barcode: v })}
                  leftIcon={<Barcode size={18} color={Colors.textSecondary} />}
                />
              </View>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={() => handleOpenScanner(row.key)}
              >
                <CameraIcon size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <PrimaryButton
        title="Simpan Barang"
        loadingTitle="Menyimpan..."
        loading={submitting}
        onPress={handleSubmit}
      />

      <BarcodeScannerModal
        visible={scanningRowKey !== null}
        onClose={() => setScanningRowKey(null)}
        onScanned={value => {
          if (scanningRowKey) {
            updateRow(scanningRowKey, { barcode: value });
          }
        }}
      />
    </ScreenLayout>
  );
};

export default TambahBarangScreen;
