import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Pencil, Trash2, Ruler, Search, X } from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { Colors } from '../../styles';
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  UnitApi,
} from '../../services/unitService';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import styles from './styles';

const SatuanScreen = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [units, setUnits] = useState<UnitApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitApi | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUnits = useCallback(async () => {
    try {
      const response = await getUnits();
      setUnits(response.data);
    } catch (error) {
      toast.error('Gagal memuat data satuan');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnits();
    }, [fetchUnits]),
  );

  const filteredUnits = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return units;

    return units.filter(unit => unit.name.toLowerCase().includes(keyword));
  }, [units, search]);

  const openAddModal = () => {
    setEditingUnit(null);
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (unit: UnitApi) => {
    setEditingUnit(unit);
    setName(unit.name);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingUnit(null);
    setName('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Periksa Kembali', 'Nama satuan wajib diisi');
      return;
    }
    setSaving(true);

    try {
      if (editingUnit) {
        await updateUnit(editingUnit.id, {
          name: name.trim(),
        });
        toast.success('Satuan berhasil diperbarui');
      } else {
        await createUnit({
          name: name.trim(),
        });
        toast.success('Satuan berhasil ditambahkan');
      }
      closeModal();
      fetchUnits();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menyimpan satuan';
      Alert.alert('Gagal', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit: UnitApi) => {
    const confirmed = await confirm({
      title: 'Hapus Satuan',
      message: `Yakin ingin menghapus satuan "${unit.name}"?`,
      confirmText: 'Hapus',
      danger: true,
    });

    if (!confirmed) return;

    try {
      await deleteUnit(unit.id);
      toast.success('Satuan berhasil dihapus');
      fetchUnits();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        'Gagal menghapus satuan (mungkin masih dipakai produk lain)';
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
      title="Satuan"
      subtitle="Kelola Satuan Barang"
      scrollable={false}
    >
      {/* SEARCH + TAMBAH */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari satuan..."
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
        <Text style={styles.listCount}>{filteredUnits.length} Satuan</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredUnits}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredUnits.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ruler size={18} color={Colors.primary} />
            </View>
            <Text style={styles.rowText} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              style={[styles.rowAction, styles.editAction]}
              onPress={() => openEditModal(item)}
              activeOpacity={0.7}
            >
              <Pencil size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rowAction, styles.deleteAction]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ruler size={38} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? 'Satuan tidak ditemukan' : 'Belum ada satuan'}
            </Text>
            <Text style={styles.emptyText}>
              {search
                ? 'Coba gunakan kata kunci lain'
                : 'Tambahkan satuan untuk digunakan pada barang'}
            </Text>
            {search && (
              <TouchableOpacity
                style={styles.resetSearchButton}
                onPress={() => setSearch('')}
              >
                <Text style={styles.resetSearchText}>Hapus Pencarian</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* MODAL */}
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
              {editingUnit ? 'Edit Satuan' : 'Tambah Satuan'}
            </Text>
            <TextField
              label="Nama Satuan"
              placeholder="Contoh: Kilogram"
              value={name}
              onChangeText={setName}
              leftIcon={<Ruler size={18} color={Colors.textSecondary} />}
            />
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

export default SatuanScreen;
