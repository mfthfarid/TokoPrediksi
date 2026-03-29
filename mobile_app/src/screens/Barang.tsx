// mobile/screens/Barang.tsx
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BarangStyles } from '../styles/BarangStyles';
import { useProducts } from '../hooks/useProducts';

const Barang = () => {
  const { products, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Calculate statistics
  const totalItems = products.length;
  const lowStockItems = products.filter(p => p.stok < 10).length;
  const totalValue = products.reduce((sum, p) => {
    const price =
      typeof p.harga === 'number'
        ? p.harga
        : parseInt(p.harga.replace(/\D/g, ''), 10);
    return sum + price * p.stok;
  }, 0);

  // Filter products
  const filteredProducts = products.filter(item => {
    const matchSearch = item.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (selectedFilter === 'low-stock') {
      return matchSearch && item.stok < 10;
    } else if (selectedFilter === 'high-price') {
      const price =
        typeof item.harga === 'number'
          ? item.harga
          : parseInt(item.harga.replace(/\D/g, ''), 10);
      return matchSearch && price > 50000;
    }
    return matchSearch;
  });

  const handleDeleteItem = (itemName: string) => {
    Alert.alert('Hapus Barang', `Yakin ingin menghapus ${itemName}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => console.log('Item deleted'),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading && products.length === 0) {
    return (
      <View style={BarangStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#35b5ff" />
        <Text style={BarangStyles.loadingText}>Memuat data barang...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={BarangStyles.errorContainer}>
        <Icon name="wifi-off" size={48} color="#f44336" />
        <Text style={BarangStyles.errorText}>Gagal Memuat Data</Text>
        <Text style={BarangStyles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={BarangStyles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={BarangStyles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={BarangStyles.wrapper}>
      {/* Header Stats */}
      <View style={BarangStyles.header}>
        <View style={BarangStyles.headerTop}>
          <View>
            <Text style={BarangStyles.headerTitle}>Data Barang</Text>
            <Text style={BarangStyles.headerSubtitle}>
              Total: {totalItems} item
            </Text>
          </View>

          {/* Tombol Tambah Statik di Atas */}
          <TouchableOpacity
            style={BarangStyles.addButton}
            onPress={() => console.log('Tambah barang baru')}
          >
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Compact Stats Row */}
        <View style={BarangStyles.statsRow}>
          <View style={BarangStyles.compactStatCard}>
            <Icon name="package-variant" size={20} color="#35b5ff" />
            <Text style={BarangStyles.compactStatValue}>{totalItems}</Text>
            <Text style={BarangStyles.compactStatLabel}>Total</Text>
          </View>
          <View
            style={[BarangStyles.compactStatCard, BarangStyles.statCardWarning]}
          >
            <Icon name="alert-circle" size={20} color="#ff9800" />
            <Text style={BarangStyles.compactStatValue}>{lowStockItems}</Text>
            <Text style={BarangStyles.compactStatLabel}>Low Stock</Text>
          </View>
          <View
            style={[BarangStyles.compactStatCard, BarangStyles.statCardSuccess]}
          >
            <Icon name="cash-multiple" size={20} color="#4caf50" />
            <Text style={BarangStyles.compactStatValue}>
              {totalValue > 1000000
                ? `${(totalValue / 1000000).toFixed(1)}jt`
                : totalValue > 1000
                ? `${(totalValue / 1000).toFixed(0)}k`
                : totalValue}
            </Text>
            <Text style={BarangStyles.compactStatLabel}>Nilai</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={BarangStyles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#35b5ff']}
          />
        }
      >
        {/* Search Bar */}
        <View style={BarangStyles.searchContainer}>
          <Icon
            name="magnify"
            size={20}
            color="#999"
            style={BarangStyles.searchIcon}
          />
          <TextInput
            style={BarangStyles.searchInput}
            placeholder="Cari barang..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={BarangStyles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                BarangStyles.filterChip,
                selectedFilter === 'all' && BarangStyles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text
                style={[
                  BarangStyles.filterChipText,
                  selectedFilter === 'all' && BarangStyles.filterChipTextActive,
                ]}
              >
                Semua
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                BarangStyles.filterChip,
                selectedFilter === 'low-stock' && BarangStyles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter('low-stock')}
            >
              <Icon
                name="alert"
                size={14}
                color={selectedFilter === 'low-stock' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  BarangStyles.filterChipText,
                  selectedFilter === 'low-stock' &&
                    BarangStyles.filterChipTextActive,
                ]}
              >
                Stok Rendah
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                BarangStyles.filterChip,
                selectedFilter === 'high-price' &&
                  BarangStyles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter('high-price')}
            >
              <Icon
                name="currency-usd"
                size={14}
                color={selectedFilter === 'high-price' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  BarangStyles.filterChipText,
                  selectedFilter === 'high-price' &&
                    BarangStyles.filterChipTextActive,
                ]}
              >
                Harga Tinggi
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Products List */}
        <View style={BarangStyles.listContainer}>
          {filteredProducts.map(item => {
            const price =
              typeof item.harga === 'number'
                ? item.harga
                : parseInt(item.harga.replace(/\D/g, ''), 10);
            const isLowStock = item.stok < 10;
            const category = item.nama.toLowerCase().includes('minum')
              ? 'Minuman'
              : 'Makanan';

            return (
              <View key={item.id} style={BarangStyles.productCard}>
                {/* Product Icon & Status */}
                <View style={BarangStyles.productIconContainer}>
                  <View style={BarangStyles.productIcon}>
                    <Icon name="package-variant" size={24} color="#35b5ff" />
                  </View>
                  {isLowStock && (
                    <View style={BarangStyles.lowStockIndicator}>
                      <Icon name="alert" size={10} color="#fff" />
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={BarangStyles.productInfo}>
                  <Text style={BarangStyles.productName} numberOfLines={1}>
                    {item.nama}
                  </Text>

                  <View style={BarangStyles.productDetails}>
                    <Text style={BarangStyles.productPrice}>
                      Rp {price.toLocaleString('id-ID')}
                    </Text>
                    <View style={BarangStyles.categoryTag}>
                      <Text style={BarangStyles.categoryText}>{category}</Text>
                    </View>
                  </View>

                  <View style={BarangStyles.stockInfo}>
                    <View
                      style={[
                        BarangStyles.stockBadge,
                        isLowStock
                          ? BarangStyles.stockLow
                          : BarangStyles.stockNormal,
                      ]}
                    >
                      <Icon
                        name={isLowStock ? 'alert' : 'check-circle'}
                        size={12}
                        color={isLowStock ? '#ff9800' : '#4caf50'}
                      />
                      <Text
                        style={[
                          BarangStyles.stockText,
                          isLowStock && BarangStyles.stockTextLow,
                        ]}
                      >
                        Stok: {item.stok}
                      </Text>
                    </View>

                    {isLowStock && (
                      <Text style={BarangStyles.lowStockWarning}>
                        Segera restok!
                      </Text>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={BarangStyles.actionButtons}>
                  <TouchableOpacity
                    style={BarangStyles.actionButton}
                    onPress={() => console.log('Edit', item.nama)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="pencil" size={18} color="#35b5ff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      BarangStyles.actionButton,
                      BarangStyles.deleteButton,
                    ]}
                    onPress={() => handleDeleteItem(item.nama)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="delete" size={18} color="#f44336" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <View style={BarangStyles.emptyState}>
            <Icon name="package-variant-closed" size={48} color="#ccc" />
            <Text style={BarangStyles.emptyText}>
              {searchQuery ? 'Barang tidak ditemukan' : 'Belum ada barang'}
            </Text>
            <Text style={BarangStyles.emptySubtext}>
              {searchQuery
                ? 'Coba kata kunci lain'
                : 'Tambahkan barang pertama'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Barang;
