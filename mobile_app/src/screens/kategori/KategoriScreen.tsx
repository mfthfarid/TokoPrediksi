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
import { Plus, Pencil, Trash2, Tag } from 'lucide-react-native';
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

  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryApi | null>(
    null,
  );
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

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
    <ScreenLayout
      title="Kategori"
      subtitle="Kelola Kategori Barang"
      scrollable={false}
    >
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Plus size={18} color="#fff" />
        <Text style={styles.addButtonText}>Tambah Kategori</Text>
      </TouchableOpacity>

      <FlatList
        data={categories}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Tag size={18} color={Colors.primary} />
            </View>
            <Text style={styles.rowText}>{item.name}</Text>
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
            <Tag size={40} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada kategori</Text>
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
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </Text>

            <TextField
              label="Nama Kategori"
              placeholder="Contoh: Minuman Sachet"
              value={name}
              onChangeText={setName}
              leftIcon={<Tag size={18} color={Colors.textSecondary} />}
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

export default KategoriScreen;
