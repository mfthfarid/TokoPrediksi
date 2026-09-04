import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Plus,
  Pencil,
  Trash2,
  Truck,
  Phone,
  MapPin,
  Search,
  X,
} from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { Colors } from '../../styles';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  SupplierApi,
} from '../../services/supplierService';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import styles from './styles';

const SupplierScreen = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [suppliers, setSuppliers] = useState<SupplierApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierApi | null>(
    null,
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await getSuppliers();
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Gagal memuat data supplier');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSuppliers();
    }, [fetchSuppliers]),
  );

  const filteredSuppliers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return suppliers;

    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(keyword),
    );
  }, [suppliers, search]);

  const openAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setAddress('');
    setModalVisible(true);
  };

  const openEditModal = (supplier: SupplierApi) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setPhone(supplier.phone ?? '');
    setAddress(supplier.address ?? '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setAddress('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Periksa Kembali', 'Nama supplier wajib diisi');
      return;
    }
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, payload);
        toast.success('Supplier berhasil diperbarui');
      } else {
        await createSupplier(payload);
        toast.success('Supplier berhasil ditambahkan');
      }

      closeModal();
      fetchSuppliers();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Gagal menyimpan supplier';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier: SupplierApi) => {
    const confirmed = await confirm({
      title: 'Hapus Supplier',
      message: `Yakin ingin menghapus "${supplier.name}"?`,
      confirmText: 'Hapus',
      danger: true,
    });

    if (!confirmed) return;

    try {
      await deleteSupplier(supplier.id);
      toast.success('Supplier berhasil dihapus');
      fetchSuppliers();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        'Gagal menghapus supplier (mungkin masih dipakai transaksi lain)';
      toast.error(message);
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
    <ScreenLayout title="Supplier" scrollable={false}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari supplier..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <X size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* JUMLAH DATA */}
      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {filteredSuppliers.length} Supplier
        </Text>
      </View>

      {/* Render */}
      <FlatList
        data={filteredSuppliers}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredSuppliers.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Truck size={19} color={Colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowText} numberOfLines={2}>
                {item.name}
              </Text>
              {item.phone ? (
                <View style={styles.infoRow}>
                  <Phone size={13} color={Colors.textSecondary} />
                  <Text style={styles.rowSubText} numberOfLines={1}>
                    {item.phone}
                  </Text>
                </View>
              ) : null}
              {item.address ? (
                <View style={styles.infoRow}>
                  <MapPin size={13} color={Colors.textSecondary} />
                  <Text style={styles.rowSubText} numberOfLines={2}>
                    {item.address}
                  </Text>
                </View>
              ) : null}
            </View>
            {/* tombol */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.rowAction, styles.editAction]}
                onPress={() => openEditModal(item)}
                activeOpacity={0.7}
              >
                <Pencil size={15} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rowAction, styles.deleteAction]}
                onPress={() => handleDelete(item)}
                activeOpacity={0.7}
              >
                <Trash2 size={15} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        // cari tidak ditemukan
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Truck size={38} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? 'Supplier tidak ditemukan' : 'Belum ada supplier'}
            </Text>
            <Text style={styles.emptyText}>
              {search
                ? 'Coba gunakan kata kunci lain'
                : 'Tambahkan supplier untuk mempermudah pencatatan pembelian'}
            </Text>
            {/* {search.length > 0 && (
              <TouchableOpacity
                style={styles.resetSearchButton}
                onPress={() => setSearch('')}
              >
                <Text style={styles.resetSearchText}>Hapus Pencarian</Text>
              </TouchableOpacity>
            )} */}
          </View>
        }
      />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingSupplier ? 'Edit Supplier' : 'Tambah Supplier'}
            </Text>
            <TextField
              label="Nama Supplier"
              placeholder="Contoh: PT Sumber Makmur"
              value={name}
              onChangeText={setName}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              leftIcon={<Truck size={18} color={Colors.textSecondary} />}
            />
            <TextField
              label="No. Telepon (opsional)"
              placeholder="Contoh: 08123456789"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color={Colors.textSecondary} />}
            />
            <View style={styles.addressField}>
              <Text style={styles.fieldLabel}>Alamat (opsional)</Text>
              <View style={styles.addressInputContainer}>
                <MapPin
                  size={18}
                  color={Colors.textSecondary}
                  style={styles.addressIcon}
                />
                <TextInput
                  style={styles.addressInput}
                  placeholder="Masukkan alamat supplier"
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeModal}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <View style={styles.modalSaveButton}>
                <PrimaryButton
                  title="Simpan"
                  loadingTitle="Menyimpan..."
                  loading={saving}
                  onPress={handleSave}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenLayout>
  );
};

export default SupplierScreen;
