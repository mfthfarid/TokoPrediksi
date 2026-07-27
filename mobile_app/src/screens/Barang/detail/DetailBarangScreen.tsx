import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
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
import styles from './styles';

type DetailRouteProp = RouteProp<BarangStackParamList, 'DetailBarang'>;

interface UnitRow {
  key: string;
  originalId: number | null; // null = baris baru, belum ada di server
  unitId: number | null;
  conversionToBase: string;
  sellPrice: string;
  barcode: string;
  isBaseUnit: boolean;
}

const createEmptyRow = (): UnitRow => ({
  key: Math.random().toString(36).slice(2),
  originalId: null,
  unitId: null,
  conversionToBase: '',
  sellPrice: '',
  barcode: '',
  isBaseUnit: false,
});

const mapUnitApiToRow = (u: ProductUnitApi): UnitRow => ({
  key: `existing-${u.id}`,
  originalId: u.id,
  unitId: u.unit_id,
  conversionToBase: u.conversion_to_base,
  sellPrice: u.sell_price != null ? String(u.sell_price) : '',
  barcode: u.barcode ?? '',
  isBaseUnit: u.is_base_unit,
});

const DetailBarangScreen = () => {
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;
  const toast = useToast();

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

  const handleToggleEdit = () => {
    if (editMode && product) {
      // Batal -> reset semua ke data asli
      setName(product.name);
      setCategoryId(product.id_kategori);
      setUnitRows(originalUnitRowsRef.current);
      setPhotoUri(null);
    }
    setEditMode(!editMode);
  };

  const updateRow = (key: string, patch: Partial<UnitRow>) => {
    setUnitRows(rows =>
      rows.map(row => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleAddRow = () => {
    setUnitRows(rows => [...rows, createEmptyRow()]);
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
      // 1. Update field produk (name, id_kategori)
      await updateProduct(id, {
        name: name.trim(),
        id_kategori: categoryId as number,
      });

      // 2. Upload foto baru kalau diganti
      if (photoUri) {
        await uploadProductPhoto(id, photoUri);
      }

      // 3. Diff satuan terhadap data asli
      const original = originalUnitRowsRef.current;
      const originalIds = original
        .map(r => r.originalId)
        .filter((v): v is number => v != null);
      const currentIds = unitRows
        .map(r => r.originalId)
        .filter((v): v is number => v != null);

      // Dihapus user -> DELETE
      const deletedIds = originalIds.filter(oid => !currentIds.includes(oid));
      for (const unitId of deletedIds) {
        await deleteUnit(id, unitId);
      }

      // Baris baru -> POST
      const newRows = unitRows.filter(r => r.originalId == null);
      for (const row of newRows) {
        await addUnit(id, {
          unit_id: row.unitId as number,
          conversion_to_base: row.conversionToBase,
          sell_price: row.sellPrice ? Number(row.sellPrice) : undefined,
          barcode: row.barcode || undefined,
          is_base_unit: row.isBaseUnit,
        });
      }

      // Baris lama yang berubah -> PUT (field biasa) / PUT khusus (harga)
      const existingRows = unitRows.filter(r => r.originalId != null);
      for (const row of existingRows) {
        const orig = original.find(o => o.originalId === row.originalId);
        if (!orig) continue;

        const otherChanged =
          row.unitId !== orig.unitId ||
          row.conversionToBase !== orig.conversionToBase ||
          row.barcode !== orig.barcode ||
          row.isBaseUnit !== orig.isBaseUnit;

        if (otherChanged) {
          await updateUnit(id, row.originalId as number, {
            unit_id: row.unitId as number,
            conversion_to_base: row.conversionToBase,
            barcode: row.barcode || undefined,
            is_base_unit: row.isBaseUnit,
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
      console.error('Save Detail Barang Error:', error?.error || error);
      toast.error('Gagal menyimpan perubahan');
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
          style={styles.editToggleButton}
          onPress={handleToggleEdit}
        >
          {editMode ? (
            <>
              <X size={16} color="#dc2626" />
              <Text style={styles.editToggleTextCancel}>Batal</Text>
            </>
          ) : (
            <>
              <Pencil size={16} color={Colors.primary} />
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
            <Text style={styles.viewValue}>{product?.kategori.name}</Text>
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
          <View key={row.key} style={styles.unitViewCard}>
            <View style={styles.unitViewHeader}>
              <Text style={styles.unitViewName}>{getUnitName(row.unitId)}</Text>
              {row.isBaseUnit && (
                <View style={styles.baseBadge}>
                  <Text style={styles.baseBadgeText}>Satuan Dasar</Text>
                </View>
              )}
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
          </View>
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
