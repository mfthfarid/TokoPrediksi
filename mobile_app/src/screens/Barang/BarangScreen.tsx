import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenLayout from '../../layouts/ScreenLayout';
import { useProducts } from '../../hooks/useProducts';
import { InventoryItem } from '../../types/types';
import { Colors } from '../../styles';
import { BarangStackParamList } from '../../navigation/types';
import styles from './BarangStyles';

type NavigationProp = NativeStackNavigationProp<BarangStackParamList, 'Barang'>;

const BarangScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { products, loading, error, refetch } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [refreshing, setRefreshing] = useState(false);

  // Refresh otomatis tiap kali screen ini kembali fokus
  // (misal balik dari TambahBarang setelah simpan sukses)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Kategori diambil dari data asli (bukan tebakan dari nama produk)
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.kategori)));
    return ['Semua', ...unique];
  }, [products]);

  const filteredProducts = products.filter(item => {
    const matchSearch = item.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === 'Semua' || item.kategori === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAdd = () => {
    navigation.navigate('TambahBarang');
  };

  const handleEdit = (item: InventoryItem) => {
    // TODO: navigation.navigate('EditBarang', { id: item.id })
    Alert.alert('Segera Hadir', 'Fitur edit barang masih dalam pengembangan.');
  };

  const handleDelete = (item: InventoryItem) => {
    // Backend saat ini belum punya endpoint DELETE /api/products/:id,
    // yang ada baru hapus per-satuan (DELETE /api/products/:id/units/:unitId)
    Alert.alert(
      'Belum Tersedia',
      'Hapus produk belum didukung backend saat ini.',
    );
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data barang...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="wifi-off" size={48} color="#f44336" />
        <Text style={styles.errorTitle}>Gagal Memuat Data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenLayout
      title="Barang"
      subtitle="Kelola Data Barang"
      scrollable={false}
    >
      {/* Search + Tambah */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama barang..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Icon name="plus" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Kategori (dinamis dari data asli) */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item, index) => `${item}-${index}`}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
        renderItem={({ item }) => {
          const isActive = item === selectedCategory;
          return (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                isActive && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && styles.categoryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Grid Produk */}
      <FlatList
        style={styles.productList}
        data={filteredProducts}
        keyExtractor={(item, index) =>
          item.id != null ? String(item.id) : `product-${index}`
        }
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imagePlaceholder}>
              <Icon name="image-outline" size={28} color="#bbb" />
            </View>

            <Text style={styles.productName} numberOfLines={1}>
              {item.nama}
            </Text>
            <Text style={styles.productPrice}>{item.harga}</Text>

            <View style={styles.cardFooterRow}>
              <View
                style={[
                  styles.stockBadge,
                  item.status === 'low' && styles.stockBadgeLow,
                ]}
              >
                <Text
                  style={[
                    styles.stockBadgeText,
                    item.status === 'low' && styles.stockBadgeTextLow,
                  ]}
                >
                  Stok {item.stok}
                </Text>
              </View>
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {item.kategori}
              </Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <Icon name="pencil" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Icon name="delete" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="package-variant-closed" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Barang tidak ditemukan' : 'Belum ada barang'}
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default BarangScreen;
