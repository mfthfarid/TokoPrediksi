import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  Switch,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import {
  Package,
  Tag,
  Barcode,
  Plus,
  Trash2,
  Camera as CameraIcon,
  Pencil,
  X,
  Image as ImageIconLucide,
  History,
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
  getProductById,
  updateProduct,
  addUnit,
  updateUnit,
  deleteUnit,
  updateUnitPrice,
  uploadProductPhoto,
  ProductApi,
  ProductUnitApi,
} from '../../../services/productService';
import { BarangStackParamList } from '../../../navigation/types';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useAlertInfo } from '../../../contexts/ConfirmContext';
import {
  getPriceInfo,
  PriceInfoApi,
} from '../../../services/priceHistoryService';
import styles from './styles';

type DetailRouteProp = RouteProp<BarangStackParamList, 'DetailBarang'>;
type NavigationProp = NativeStackNavigationProp<
  BarangStackParamList,
  'DetailBarang'
>;

interface UnitRow {
  key: string;
  originalId: number | null;
  unitId: number | null;
  conversionToBase: string;
  sellPrice: string;
  barcode: string;
  isBaseUnit: boolean;
  isActive: boolean;
}

const createEmptyRow = (): UnitRow => ({
  key: Math.random().toString(36).slice(2),
  originalId: null,
  unitId: null,
  conversionToBase: '',
  sellPrice: '',
  barcode: '',
  isBaseUnit: false,
  isActive: true,
});

const mapUnitApiToRow = (u: ProductUnitApi): UnitRow => ({
  key: `existing-${u.id}`,
  originalId: u.id,
  unitId: u.unit_id,
  conversionToBase: u.conversion_to_base,
  sellPrice: u.sell_price != null ? String(u.sell_price) : '',
  barcode: u.barcode ?? '',
  isBaseUnit: u.is_base_unit,
  isActive: u.is_active,
});

const DetailBarangScreen = () => {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { id } = route.params;
  const toast = useToast();
  const confirm = useConfirm();
  const alertInfo = useAlertInfo();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductApi | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [unitRows, setUnitRows] = useState<UnitRow[]>([]);
  const originalUnitRowsRef = useRef<UnitRow[]>([]);

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([]);
  const [scanningRowKey, setScanningRowKey] = useState<string | null>(null);
  const [priceInfoMap, setPriceInfoMap] = useState<
    Record<number, PriceInfoApi>
  >({});

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const [productRes, categoriesRes, unitsRes] = await Promise.all([
        getProductById(id),
        getCategories(),
        getUnits(),
      ]);

      const p = productRes.data;
      setProduct(p);
      setName(p.name);
      setCategoryId(p.id_kategori);

      const rows = p.units.map(mapUnitApiToRow);
      setUnitRows(rows);
      originalUnitRowsRef.current = rows;

      setCategoryOptions(
        categoriesRes.data.map(c => ({ label: c.name, value: c.id })),
      );
      setUnitOptions(unitsRes.data.map(u => ({ label: u.name, value: u.id })));
    } catch (error) {
      toast.error('Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleToggleEdit = async () => {
    if (editMode && product) {
      setName(product.name);
      setCategoryId(product.id_kategori);
      setUnitRows(originalUnitRowsRef.current);
      setPhotoUri(null);
      setEditMode(false);
      return;
    }

    // Masuk ke mode edit -> ambil harga modal terbaru tiap satuan yang sudah ada
    setEditMode(true);
    const existingRows = unitRows.filter(r => r.originalId != null);
    try {
      const results = await Promise.all(
        existingRows.map(row => getPriceInfo(id, row.originalId as number)),
      );
      const map: Record<number, PriceInfoApi> = {};
      existingRows.forEach((row, index) => {
        map[row.originalId as number] = results[index].data;
      });
      setPriceInfoMap(map);
    } catch (error) {
      // Gagal ambil info modal bukan hal fatal - biarkan edit tetap jalan
    }
  };

  const updateRow = (key: string, patch: Partial<UnitRow>) => {
    setUnitRows(rows =>
      rows.map(row => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleAddRow = () => {
    setUnitRows(rows => [...rows, createEmptyRow()]);
  };

  const handleRemoveRow = async (row: UnitRow) => {
    if (unitRows.length === 1) {
      Alert.alert('Tidak Bisa', 'Minimal harus ada 1 satuan.');
      return;
    }

    // Baris baru yang belum pernah tersimpan di server - cukup hapus lokal
    if (row.originalId == null) {
      setUnitRows(rows => rows.filter(r => r.key !== row.key));
      return;
    }

    const confirmed = await confirm({
      title: 'Hapus Satuan',
      message: `Yakin ingin menghapus satuan "${getUnitName(row.unitId)}"?`,
      confirmText: 'Hapus',
      danger: true,
    });
    if (!confirmed) return;

    try {
      await deleteUnit(id, row.originalId);
      setUnitRows(rows => {
        const remaining = rows.filter(r => r.key !== row.key);
        // Kalau yang dihapus itu satuan dasar, promosikan baris pertama sisanya
        if (
          row.isBaseUnit &&
          remaining.length > 0 &&
          !remaining.some(r => r.isBaseUnit)
        ) {
          const newBaseRow = remaining[0];
          remaining[0] = {
            ...newBaseRow,
            isBaseUnit: true,
            conversionToBase: '1',
          };
          if (newBaseRow.originalId != null) {
            updateUnit(id, newBaseRow.originalId, {
              unit_id: newBaseRow.unitId as number,
              conversion_to_base: '1',
              is_base_unit: true,
            }).catch(() => {});
          }
        }
        return remaining;
      });

      originalUnitRowsRef.current = originalUnitRowsRef.current.filter(
        r => r.originalId !== row.originalId,
      );

      toast.success('Satuan berhasil dihapus');
    } catch (error: any) {
      const message =
        error?.response?.data?.error || 'Satuan tidak dapat dihapus.';
      await alertInfo({ title: 'Tidak Bisa Dihapus', message, danger: true });
    }
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
        Alert.alert('Izin Ditolak', 'Aktifkan izin kamera di pengaturan HP.');
        return;
      }
    }
    setScanningRowKey(rowKey);
  };

  const getUnitName = (unitId: number | null) =>
    unitOptions.find(o => o.value === unitId)?.label || 'Satuan';

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
      return 'Ada satuan yang dipilih dobel';
    }
    if (!unitRows.some(r => r.isBaseUnit)) {
      return 'Harus ada 1 satuan dasar';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Periksa Kembali', validationError);
      return;
    }

    setSaving(true);
    try {
      await updateProduct(id, {
        name: name.trim(),
        id_kategori: categoryId as number,
      });

      if (photoUri) {
        await uploadProductPhoto(id, photoUri);
      }

      const original = originalUnitRowsRef.current;
      const originalIds = original
        .map(r => r.originalId)
        .filter((v): v is number => v != null);
      const currentIds = unitRows
        .map(r => r.originalId)
        .filter((v): v is number => v != null);

      const newRows = unitRows.filter(r => r.originalId == null);
      for (const row of newRows) {
        await addUnit(id, {
          unit_id: row.unitId as number,
          conversion_to_base: row.conversionToBase,
          sell_price: row.sellPrice ? Number(row.sellPrice) : undefined,
          barcode: row.barcode || undefined,
          is_base_unit: row.isBaseUnit,
          is_active: row.isActive,
        });
      }

      const existingRows = unitRows.filter(r => r.originalId != null);
      for (const row of existingRows) {
        const orig = original.find(o => o.originalId === row.originalId);
        if (!orig) continue;

        const otherChanged =
          row.unitId !== orig.unitId ||
          row.conversionToBase !== orig.conversionToBase ||
          row.barcode !== orig.barcode ||
          row.isBaseUnit !== orig.isBaseUnit ||
          row.isActive !== orig.isActive;

        if (otherChanged) {
          await updateUnit(id, row.originalId as number, {
            unit_id: row.unitId as number,
            conversion_to_base: row.conversionToBase,
            barcode: row.barcode || undefined,
            is_base_unit: row.isBaseUnit,
            is_active: row.isActive,
          });
        }

        if (row.sellPrice !== orig.sellPrice && row.sellPrice) {
          await updateUnitPrice(
            id,
            row.originalId as number,
            Number(row.sellPrice),
          );
        }
      }

      toast.success('Perubahan berhasil disimpan');
      setEditMode(false);
      setPhotoUri(null);
      await fetchProduct();
    } catch (error: any) {
      console.error(
        'Save Detail Barang Error:',
        error?.response?.data?.error || error?.message || error,
      );
      const message =
        error?.response?.data?.error || 'Gagal menyimpan perubahan';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout
      title={product?.name ?? 'Detail Barang'}
      subtitle={editMode ? 'Mode Edit' : 'Detail Barang'}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() =>
            navigation.navigate('RiwayatStok', {
              productId: id,
              productName: product?.name ?? '',
            })
          }
        >
          <History size={16} color={Colors.primary} />
          <Text style={styles.historyButtonText}>Riwayat Stok</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.editToggleButton,
            editMode && styles.cancelToggleButton,
          ]}
          onPress={handleToggleEdit}
        >
          {editMode ? (
            <>
              <X size={16} color="#fff" />
              <Text style={styles.editToggleText}>Batal</Text>
            </>
          ) : (
            <>
              <Pencil size={16} color="#fff" />
              <Text style={styles.editToggleText}>Edit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.basicInfoCard}>
        {editMode ? (
          <PhotoPicker
            value={photoUri ?? product?.photo_detail_url ?? null}
            onChange={setPhotoUri}
          />
        ) : product?.photo_detail_url ? (
          <FastImage
            source={{ uri: product.photo_detail_url }}
            style={styles.photoView}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <ImageIconLucide size={32} color="#bbb" />
          </View>
        )}

        {editMode ? (
          <TextField
            label="Nama Barang"
            placeholder="Ketikan nama barang"
            value={name}
            onChangeText={setName}
            leftIcon={<Package size={20} color={Colors.textSecondary} />}
          />
        ) : (
          <View style={styles.viewField}>
            <Text style={styles.viewLabel}>Nama Barang</Text>
            <Text style={styles.viewValue}>{product?.name}</Text>
          </View>
        )}

        {editMode ? (
          <SelectField
            label="Kategori Barang"
            placeholder="Pilih Kategori"
            value={categoryId}
            options={categoryOptions}
            onSelect={value => setCategoryId(Number(value))}
            leftIcon={<Tag size={18} color={Colors.textSecondary} />}
          />
        ) : (
          <View style={styles.viewField}>
            <Text style={styles.viewLabel}>Kategori</Text>
            <Text style={styles.viewValue}>
              {product?.kategori?.name ?? 'Tanpa Kategori'}
            </Text>
          </View>
        )}

        <View style={styles.viewField}>
          <Text style={styles.viewLabel}>Stok</Text>
          <Text style={styles.viewValue}>
            {product?.stock ?? '0'} (diperbarui lewat fitur Restock)
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Satuan & Harga Jual</Text>
        {editMode && (
          <TouchableOpacity style={styles.addRowButton} onPress={handleAddRow}>
            <Plus size={16} color={Colors.primary} />
            <Text style={styles.addRowButtonText}>Tambah Satuan</Text>
          </TouchableOpacity>
        )}
      </View>

      {unitRows.map((row, index) =>
        editMode ? (
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
                <TouchableOpacity onPress={() => handleRemoveRow(row)}>
                  <Trash2 size={18} color="#dc2626" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.activeToggleRow}>
              <Text style={styles.activeToggleLabel}>
                {row.isActive ? 'Aktif Dijual' : 'Nonaktif (tidak dijual)'}
              </Text>
              <Switch
                value={row.isActive}
                onValueChange={value => updateRow(row.key, { isActive: value })}
              />
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
                      : `Isi Dalam 1 ${getUnitName(row.unitId)}`
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

            {row.originalId != null &&
              priceInfoMap[row.originalId]?.cost_per_unit != null && (
                <Text style={styles.costInfoText}>
                  Harga Modal Terbaru: Rp{' '}
                  {priceInfoMap[row.originalId].cost_per_unit!.toLocaleString(
                    'id-ID',
                  )}
                </Text>
              )}

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
        ) : (
          <TouchableOpacity
            key={row.key}
            style={styles.unitViewCard}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('RiwayatHarga', {
                productId: id,
                unitId: row.originalId as number,
                unitName: getUnitName(row.unitId),
              })
            }
            disabled={row.originalId == null}
          >
            <View style={styles.unitViewHeader}>
              <Text style={styles.unitViewName}>{getUnitName(row.unitId)}</Text>
              <View style={styles.unitViewBadges}>
                {row.isBaseUnit && (
                  <View style={styles.baseBadge}>
                    <Text style={styles.baseBadgeText}>Satuan Dasar</Text>
                  </View>
                )}
                {!row.isActive && (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveBadgeText}>Nonaktif</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.unitViewDetail}>
              Harga:{' '}
              {row.sellPrice
                ? `Rp ${Number(row.sellPrice).toLocaleString('id-ID')}`
                : 'Belum diatur'}
            </Text>
            {!row.isBaseUnit && (
              <Text style={styles.unitViewDetail}>
                Isi: {row.conversionToBase} pcs
              </Text>
            )}
            {row.barcode ? (
              <Text style={styles.unitViewDetail}>Barcode: {row.barcode}</Text>
            ) : null}
            <Text style={styles.unitViewTapHint}>
              Tekan untuk lihat riwayat harga →
            </Text>
          </TouchableOpacity>
        ),
      )}

      {editMode && (
        <PrimaryButton
          title="Simpan Perubahan"
          loadingTitle="Menyimpan..."
          loading={saving}
          onPress={handleSave}
        />
      )}

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

export default DetailBarangScreen;
