import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Truck, Plus, Trash2, Package } from 'lucide-react-native';
import ScreenLayout from '../../../layouts/ScreenLayout';
import TextField from '../../../components/ui/TextField';
import CurrencyField from '../../../components/ui/CurrencyField/CurrencyField';
import SelectField, { SelectOption } from '../../../components/ui/SelectField';
import DateField from '../../../components/ui/DateField';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { Colors } from '../../../styles';
import { getSuppliers } from '../../../services/supplierService';
import { getProducts, ProductApi } from '../../../services/productService';
import { createPurchase } from '../../../services/purchaseService';
import { DashboardStackParamList } from '../../../navigation/types';
import { useToast } from '../../../contexts/ToastContext';
import { RouteProp, useRoute } from '@react-navigation/native';
import { BottomTabParamList } from './../../../navigation/types';
import styles from './styles';

type NavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'TambahPembelian'
>;
type TambahPembelianRouteProp = RouteProp<
  DashboardStackParamList,
  'TambahPembelian'
>;

interface PurchaseItemRow {
  key: string;
  productId: number | null;
  productUnitId: number | null;
  quantity: string;
  purchasePrice: string; // harga PER SATUAN (bukan total baris)
  expiryDate: string;
}

const createEmptyItem = (): PurchaseItemRow => ({
  key: Math.random().toString(36).slice(2),
  productId: null,
  productUnitId: null,
  quantity: '',
  purchasePrice: '',
  expiryDate: '',
});

const formatDateToday = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${now.getFullYear()}`;
};

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const calculateItemSubtotal = (item: PurchaseItemRow): number => {
  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.purchasePrice) || 0;
  return qty * price;
};

const calculateGrandTotal = (items: PurchaseItemRow[]): number =>
  items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);

const TambahPembelianScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([]);
  const [products, setProducts] = useState<ProductApi[]>([]);

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [purchaseDate, setPurchaseDate] = useState(formatDateToday());
  const [items, setItems] = useState<PurchaseItemRow[]>([createEmptyItem()]);
  const [submitting, setSubmitting] = useState(false);

  // Prefill dari Prediksi (kalau dibuka lewat tombol "Restock" di Detail Prediksi)
  useEffect(() => {
    const route = useRoute<TambahPembelianRouteProp>();
    const prefillProductId = route.params?.prefillProductId;
    const prefillQuantity = route.params?.prefillQuantity;
    if (!prefillProductId || products.length === 0) return;

    const product = products.find(p => p.id === prefillProductId);
    if (!product) return;

    const baseUnit =
      product.units.find(u => u.is_base_unit) ?? product.units[0];
    if (!baseUnit) return;

    setItems([
      {
        key: Math.random().toString(36).slice(2),
        productId: product.id,
        productUnitId: baseUnit.id,
        quantity: prefillQuantity ? String(prefillQuantity) : '',
        purchasePrice: '',
        expiryDate: '',
      },
    ]);
  }, [products]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          getSuppliers(),
          getProducts(),
        ]);
        setSupplierOptions(
          suppliersRes.data.map(s => ({ label: s.name, value: s.id })),
        );
        setProducts(productsRes.data);
      } catch (error) {
        toast.error('Gagal memuat data supplier/produk');
      } finally {
        setLoadingOptions(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
    loadOptions();
  }, []);

  const productOptions: SelectOption[] = products.map(p => ({
    label: p.name,
    value: p.id,
  }));

  const getUnitOptionsForProduct = (
    productId: number | null,
  ): SelectOption[] => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    return product.units.map(u => ({
      label: u.unit.name,
      value: u.id, // product_unit_id, BUKAN unit_id
    }));
  };

  const updateItem = (key: string, patch: Partial<PurchaseItemRow>) => {
    setItems(rows =>
      rows.map(row => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleAddItem = () => {
    setItems(rows => [...rows, createEmptyItem()]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(rows => {
      if (rows.length === 1) {
        Alert.alert('Tidak Bisa', 'Minimal harus ada 1 item barang.');
        return rows;
      }
      return rows.filter(row => row.key !== key);
    });
  };

  const validate = (): string | null => {
    if (!supplierId) return 'Supplier wajib dipilih';
    if (!purchaseDate) return 'Tanggal pembelian wajib diisi';

    for (const item of items) {
      if (!item.productId) return 'Semua item wajib pilih produk';
      if (!item.productUnitId) return 'Semua item wajib pilih satuan';
      if (!item.quantity) return 'Semua item wajib isi jumlah';
      if (!item.purchasePrice) return 'Semua item wajib isi harga beli';
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
      await createPurchase({
        supplier_id: supplierId as number,
        purchase_date: purchaseDate,
        items: items.map(item => ({
          product_id: item.productId as number,
          product_unit_id: item.productUnitId as number,
          quantity: item.quantity,
          purchase_price: Number(item.purchasePrice),
          tanggal_kadaluwarsa: item.expiryDate || undefined,
        })),
      });

      toast.success('Pembelian berhasil dicatat');
      navigation.goBack();
    } catch (error: any) {
      const message =
        error.response?.data?.error || 'Gagal menyimpan pembelian';
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
    <ScreenLayout
      title="Catat Pembelian"
      subtitle="Restok Barang"
      scrollable={false}
      footer={
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>Total Pembelian</Text>
            <Text style={styles.footerTotal}>
              {formatRupiah(calculateGrandTotal(items))}
            </Text>
          </View>
          <View style={styles.footerButton}>
            <PrimaryButton
              title="Simpan"
              loadingTitle="Menyimpan..."
              loading={submitting}
              onPress={handleSubmit}
            />
          </View>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.basicInfoCard}>
          <SelectField
            label="Supplier"
            placeholder="Pilih Supplier"
            value={supplierId}
            options={supplierOptions}
            onSelect={value => setSupplierId(Number(value))}
            leftIcon={<Truck size={18} color={Colors.textSecondary} />}
          />

          <DateField
            label="Tanggal Pembelian"
            value={purchaseDate}
            onChange={setPurchaseDate}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Item Barang</Text>
          <TouchableOpacity style={styles.addRowButton} onPress={handleAddItem}>
            <Plus size={16} color={Colors.primary} />
            <Text style={styles.addRowButtonText}>Tambah Item</Text>
          </TouchableOpacity>
        </View>

        {items.map((item, index) => {
          const unitOptions = getUnitOptionsForProduct(item.productId);
          const subtotal = calculateItemSubtotal(item);

          return (
            <View key={item.key} style={styles.itemCard}>
              <View style={styles.itemCardHeader}>
                <Text style={styles.itemCardTitle}>Item {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveItem(item.key)}>
                    <Trash2 size={18} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>

              <SelectField
                label="Produk"
                placeholder="Pilih Produk"
                value={item.productId}
                options={productOptions}
                onSelect={value =>
                  updateItem(item.key, {
                    productId: Number(value),
                    productUnitId: null,
                  })
                }
                leftIcon={<Package size={18} color={Colors.textSecondary} />}
              />

              <SelectField
                label="Satuan"
                placeholder={
                  item.productId ? 'Pilih Satuan' : 'Pilih produk dulu'
                }
                value={item.productUnitId}
                options={unitOptions}
                onSelect={value =>
                  updateItem(item.key, { productUnitId: Number(value) })
                }
                disabled={!item.productId}
              />

              <DateField
                label="Tanggal Kadaluwarsa"
                value={item.expiryDate}
                onChange={v => updateItem(item.key, { expiryDate: v })}
              />

              <View style={styles.rowInline}>
                <View style={styles.rowInlineItem}>
                  <TextField
                    label="Jumlah"
                    placeholder="0"
                    value={item.quantity}
                    onChangeText={v => updateItem(item.key, { quantity: v })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.rowInlineItem}>
                  <CurrencyField
                    label="Harga Per Satuan"
                    placeholder="0"
                    value={item.purchasePrice}
                    onChangeValue={v =>
                      updateItem(item.key, { purchasePrice: v })
                    }
                  />
                </View>
              </View>

              {subtotal > 0 && (
                <Text style={styles.itemSubtotal}>
                  Subtotal: {formatRupiah(subtotal)}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </ScreenLayout>
  );
};

export default TambahPembelianScreen;
