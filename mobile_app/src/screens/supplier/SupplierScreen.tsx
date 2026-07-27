import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Plus,
  Pencil,
  Trash2,
  Truck,
  Phone,
  MapPin,
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
    <ScreenLayout
      title="Supplier"
      subtitle="Kelola Data Supplier"
      scrollable={false}
    >
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Plus size={18} color="#fff" />
        <Text style={styles.addButtonText}>Tambah Supplier</Text>
      </TouchableOpacity>

      <FlatList
        data={suppliers}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Truck size={18} color={Colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowText}>{item.name}</Text>
              {item.phone ? (
                <Text style={styles.rowSubText}>{item.phone}</Text>
              ) : null}
              {item.address ? (
                <Text style={styles.rowSubText} numberOfLines={1}>
                  {item.address}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.rowAction}
              onPress={() => openEditModal(item)}
            >
              <Pencil size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rowAction}
              onPress={() => handleDelete(item)}
            >
              <Trash2 size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Truck size={40} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada supplier</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingSupplier ? 'Edit Supplier' : 'Tambah Supplier'}
            </Text>

            <TextField
              label="Nama Supplier"
              placeholder="Contoh: PT Sumber Makmur"
              value={name}
              onChangeText={setName}
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

            <TextField
              label="Alamat (opsional)"
              placeholder="Alamat supplier"
              value={address}
              onChangeText={setAddress}
              leftIcon={<MapPin size={18} color={Colors.textSecondary} />}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeModal}
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
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
};

export default SupplierScreen;
