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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BarangStyles } from '../styles/BarangStyles';
import { useProducts } from '../hooks/useProducts';

const Barang = () => {
  const { products, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const totalItems = products.length;
  const lowStockItems = products.filter(p => p.stok < 10).length;
  const totalValue = products.reduce((sum, p) => {
    const price =
      typeof p.harga === 'number'
        ? p.harga
        : parseInt(p.harga.replace(/\D/g, ''), 10);
    return sum + price * p.stok;
  }, 0);

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

  if (loading) {
    return (
      <View style={BarangStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#35b5ff" />
        <Text style={BarangStyles.loadingText}>Memuat data barang...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={BarangStyles.errorContainer}>
        <Icon name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={BarangStyles.errorText}>Terjadi Kesalahan</Text>
        <Text style={BarangStyles.errorMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={BarangStyles.wrapper}>
      <View style={BarangStyles.header}>
        <View style={BarangStyles.headerTop}>
          <View>
            <Text style={BarangStyles.headerTitle}>Data Barang</Text>
            <Text style={BarangStyles.headerSubtitle}>Daftar Barang</Text>
          </View>
          <TouchableOpacity style={BarangStyles.scanButton}>
            <Icon name="barcode-scan" size={24} color="#35b5ff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={BarangStyles.statsContainer}
        >
          <View style={BarangStyles.statCard}>
            <Icon name="package-variant" size={24} color="#35b5ff" />
            <Text style={BarangStyles.statValue}>{totalItems}</Text>
            <Text style={BarangStyles.statLabel}>Total Item</Text>
          </View>

          <View style={[BarangStyles.statCard, BarangStyles.statCardWarning]}>
            <Icon name="alert-circle" size={24} color="#ff9800" />
            <Text style={BarangStyles.statValue}>{lowStockItems}</Text>
            <Text style={BarangStyles.statLabel}>Stok Rendah</Text>
          </View>

          <View style={[BarangStyles.statCard, BarangStyles.statCardSuccess]}>
            <Icon name="cash-multiple" size={24} color="#4caf50" />
            <Text style={BarangStyles.statValue}>
              Rp {(totalValue / 1000).toFixed(0)}K
            </Text>
            <Text style={BarangStyles.statLabel}>Nilai Total</Text>
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={BarangStyles.container}
        showsVerticalScrollIndicator={false}
      >
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={BarangStyles.filterContainer}
        >
          <TouchableOpacity
            style={[
              BarangStyles.filterButton,
              selectedFilter === 'all' && BarangStyles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                BarangStyles.filterButtonText,
                selectedFilter === 'all' && BarangStyles.filterButtonTextActive,
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              BarangStyles.filterButton,
              selectedFilter === 'low-stock' && BarangStyles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('low-stock')}
          >
            <Icon
              name="alert"
              size={16}
              color={selectedFilter === 'low-stock' ? '#fff' : '#666'}
            />
            <Text
              style={[
                BarangStyles.filterButtonText,
                selectedFilter === 'low-stock' &&
                  BarangStyles.filterButtonTextActive,
              ]}
            >
              Stok Rendah
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              BarangStyles.filterButton,
              selectedFilter === 'high-price' &&
                BarangStyles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('high-price')}
          >
            <Icon
              name="currency-usd"
              size={16}
              color={selectedFilter === 'high-price' ? '#fff' : '#666'}
            />
            <Text
              style={[
                BarangStyles.filterButtonText,
                selectedFilter === 'high-price' &&
                  BarangStyles.filterButtonTextActive,
              ]}
            >
              Harga Tinggi
            </Text>
          </TouchableOpacity>
        </ScrollView>

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
              <View key={item.id} style={BarangStyles.barangItem}>
                <View style={BarangStyles.itemLeft}>
                  <View style={BarangStyles.itemIconContainer}>
                    <View style={BarangStyles.itemIcon}>
                      <Icon name="package-variant" size={28} color="#35b5ff" />
                    </View>
                    {isLowStock && (
                      <View style={BarangStyles.lowStockBadge}>
                        <Icon name="alert" size={12} color="#fff" />
                      </View>
                    )}
                  </View>

                  <View style={BarangStyles.itemContent}>
                    <Text style={BarangStyles.itemName}>{item.nama}</Text>

                    <View style={BarangStyles.categoryBadge}>
                      <Icon name="tag" size={12} color="#35b5ff" />
                      <Text style={BarangStyles.categoryText}>{category}</Text>
                    </View>

                    <View style={BarangStyles.priceContainer}>
                      <View>
                        <Text style={BarangStyles.priceLabel}>Harga Jual</Text>
                        <Text style={BarangStyles.itemPrice}>
                          Rp {price.toLocaleString('id-ID')}
                        </Text>
                      </View>
                      <View style={BarangStyles.profitBadge}>
                        <Icon name="trending-up" size={12} color="#4caf50" />
                        <Text style={BarangStyles.profitText}>+25%</Text>
                      </View>
                    </View>

                    <View style={BarangStyles.stockContainer}>
                      <View
                        style={[
                          BarangStyles.stokBadge,
                          isLowStock
                            ? BarangStyles.stokLow
                            : BarangStyles.stokNormal,
                        ]}
                      >
                        <Icon
                          name={isLowStock ? 'alert' : 'check-circle'}
                          size={14}
                          color={isLowStock ? '#ff9800' : '#4caf50'}
                        />
                        <Text
                          style={[
                            BarangStyles.stokText,
                            isLowStock && BarangStyles.stokTextLow,
                          ]}
                        >
                          Stok: {item.stok}
                        </Text>
                      </View>

                      {isLowStock && (
                        <Text style={BarangStyles.warningText}>
                          Segera restok!
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                <View style={BarangStyles.itemRight}>
                  <TouchableOpacity
                    style={BarangStyles.quickActionButton}
                    onPress={() => console.log('Edit', item.nama)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="pencil" size={20} color="#35b5ff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      BarangStyles.quickActionButton,
                      BarangStyles.deleteButton,
                    ]}
                    onPress={() => handleDeleteItem(item.nama)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="delete" size={20} color="#f44336" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {filteredProducts.length === 0 && (
          <View style={BarangStyles.emptyState}>
            <Icon name="package-variant-closed" size={64} color="#ccc" />
            <Text style={BarangStyles.emptyText}>
              {searchQuery ? 'Barang tidak ditemukan' : 'Belum ada data barang'}
            </Text>
            <Text style={BarangStyles.emptySubtext}>
              {searchQuery
                ? 'Coba kata kunci lain'
                : 'Tap tombol + untuk menambah barang'}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={BarangStyles.fab}
        activeOpacity={0.8}
        onPress={() => console.log('Add new item')}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Barang;
