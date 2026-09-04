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
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Plus, Pencil, Trash2, Tag, Search, X } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenLayout from '../../layouts/ScreenLayout';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { Colors } from '../../styles';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  CategoryApi,
} from '../../services/categoryService';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import styles from './styles';

const KategoriScreen = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryApi | null>(
    null,
  );
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return categories;

    return categories.filter(category =>
      category.name.toLowerCase().includes(keyword),
    );
  }, [categories, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories]),
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (category: CategoryApi) => {
    setEditingCategory(category);
    setName(category.name);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    setName('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Periksa Kembali', 'Nama kategori wajib diisi');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: name.trim() });
        toast.success('Kategori berhasil diperbarui');
      } else {
        await createCategory({ name: name.trim() });
        toast.success('Kategori berhasil ditambahkan');
      }
      closeModal();
      fetchCategories();
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Gagal menyimpan kategori';
      Alert.alert('Gagal', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: CategoryApi) => {
    const confirmed = await confirm({
      title: 'Hapus Kategori',
      message: `Yakin ingin menghapus kategori "${category.name}"?`,
      confirmText: 'Hapus',
      danger: true,
    });

    if (!confirmed) return;

    try {
      await deleteCategory(category.id);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        'Gagal menghapus kategori (mungkin masih dipakai produk lain)';
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
    <ScreenLayout title="Kategori" scrollable={false}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />

          <TextInput
            style={styles.searchInput}
            placeholder="Cari kategori..."
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

      {/* Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {filteredCategories.length} Kategori
        </Text>
      </View>

      {/* Render */}
      <FlatList
        data={filteredCategories}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredCategories.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Tag size={18} color={Colors.primary} />
            </View>
            <Text style={styles.rowText} numberOfLines={1}>
              {item.name}
            </Text>
            {/* Tombol Edit */}
            <TouchableOpacity
              style={[styles.rowAction, styles.editAction]}
              onPress={() => openEditModal(item)}
              activeOpacity={0.7}
            >
              <Pencil size={16} color={Colors.primary} />
            </TouchableOpacity>
            {/* Tombol Hapus */}
            <TouchableOpacity
              style={[styles.rowAction, styles.deleteAction]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
        // cari tidak ditemukan
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Tag size={38} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
            </Text>
            <Text style={styles.emptyText}>
              {search
                ? 'Coba gunakan kata kunci lain'
                : 'Tambahkan kategori untuk mengelompokkan barang'}
            </Text>
            {/* {search && (
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
          style={styles.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </Text>
            <TextField
              label="Nama Kategori"
              placeholder="Contoh: Minuman Sachet"
              value={name}
              onChangeText={setName}
              leftIcon={<Tag size={18} color={Colors.textSecondary} />}
            />
            {/* Tombol */}
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenLayout>
  );
};

export default KategoriScreen;
