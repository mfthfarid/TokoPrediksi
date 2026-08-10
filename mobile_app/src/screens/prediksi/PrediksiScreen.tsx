import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Sparkles,
  AlertTriangle,
  TrendingDown,
  ShoppingCart,
  Clock,
  Package,
} from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout'; // Sesuaikan path jika berbeda
import { Colors } from '../../styles'; // Sesuaikan path
import styles from './styles';

// Tipe data sementara (sesuaikan dengan tipe dari API nantinya)
interface PredictionItem {
  id: number;
  name: string;
  stock: number;
  unit: string;
  daysLeft: number;
  soldPerDay: number;
  recommendedRestock: number;
}

// Data Dummy untuk testing UI
const DUMMY_DATA: PredictionItem[] = [
  {
    id: 1,
    name: 'Beras Sania 5kg',
    stock: 3,
    unit: 'Sak',
    daysLeft: 1, // Kritis (Merah)
    soldPerDay: 2.5,
    recommendedRestock: 15,
  },
  {
    id: 2,
    name: 'Kopi Kapal Api',
    stock: 20,
    unit: 'Renceng',
    daysLeft: 5, // Waspada (Kuning)
    soldPerDay: 4,
    recommendedRestock: 10,
  },
  {
    id: 3,
    name: 'Minyak Goreng Bimoli 2L',
    stock: 1,
    unit: 'Pouch',
    daysLeft: 0, // Habis (Merah)
    soldPerDay: 1,
    recommendedRestock: 24,
  },
];

const PrediksiScreen = () => {
  const navigation = useNavigation<any>(); // Ganti dengan tipe navigasi Anda
  const [activeTab, setActiveTab] = useState<'kritis' | 'rekomendasi'>(
    'kritis',
  );
  const [isPredicting, setIsPredicting] = useState(false);

  // Simulasi menekan tombol "Jalankan Prediksi"
  const handleJalankanPrediksi = () => {
    setIsPredicting(true);
    // Simulasi loading API 2 detik
    setTimeout(() => {
      setIsPredicting(false);
    }, 2000);
  };

  const handleRestokSekarang = (item: PredictionItem) => {
    // Arahkan ke halaman TambahPembelian sambil membawa data rekomendasi
    // navigation.navigate('TambahPembelian', { selectedProduct: item.id, qty: item.recommendedRestock });
    console.log('Restok:', item.name);
  };

  const renderItem = ({ item }: { item: PredictionItem }) => {
    const isCritical = item.daysLeft <= 3;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            <View style={styles.iconContainer}>
              <Package size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.stockText}>
                Sisa: <Text style={styles.stockNumber}>{item.stock}</Text>{' '}
                {item.unit}
              </Text>
            </View>
          </View>

          {/* Badge Status */}
          <View
            style={[
              styles.badge,
              isCritical ? styles.badgeDanger : styles.badgeWarning,
            ]}
          >
            {isCritical ? (
              <AlertTriangle
                size={12}
                color={isCritical ? '#dc2626' : '#d97706'}
              />
            ) : (
              <TrendingDown size={12} color="#d97706" />
            )}
            <Text
              style={[
                styles.badgeText,
                isCritical ? styles.textDanger : styles.textWarning,
              ]}
            >
              {item.daysLeft === 0
                ? 'Habis Hari Ini'
                : `Habis < ${item.daysLeft} Hari`}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsLabel}>Rata-rata Terjual</Text>
            <Text style={styles.statsValue}>
              {item.soldPerDay} {item.unit}/hari
            </Text>
          </View>

          <TouchableOpacity
            style={styles.restokButton}
            onPress={() => handleRestokSekarang(item)}
            activeOpacity={0.8}
          >
            <ShoppingCart size={16} color="#fff" style={styles.restokIcon} />
            <Text style={styles.restokButtonText}>
              Restok ({item.recommendedRestock})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout title="Prediksi Cerdas" scrollable={false}>
      {/* Hero Section (Panel Kontrol AI) */}
      <View style={styles.heroContainer}>
        <View style={styles.heroHeader}>
          <Clock size={16} color="#6366f1" />
          <Text style={styles.heroUpdateText}>
            Update terakhir: Hari ini, 07:00 WIB
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.predictButton,
            isPredicting && styles.predictButtonDisabled,
          ]}
          onPress={handleJalankanPrediksi}
          disabled={isPredicting}
          activeOpacity={0.8}
        >
          {isPredicting ? (
            <ActivityIndicator
              color="#fff"
              size="small"
              style={{ marginRight: 8 }}
            />
          ) : (
            <Sparkles size={20} color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.predictButtonText}>
            {isPredicting ? 'Menganalisis Data...' : 'Jalankan Prediksi AI'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Control / Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'kritis' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('kritis')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'kritis' && styles.tabTextActive,
            ]}
          >
            🔥 Rawan Habis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'rekomendasi' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('rekomendasi')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'rekomendasi' && styles.tabTextActive,
            ]}
          >
            🛒 Rekomendasi Restok
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Barang */}
      <FlatList
        data={DUMMY_DATA}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Tambahkan skeleton jika API sedang loading
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Tidak ada barang yang perlu diwaspadai saat ini.
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default PrediksiScreen;
