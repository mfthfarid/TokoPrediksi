// mobile/components/MainLayout.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Header from './common/Header';
// import TabNavigator from './TabNavigator';
import TabNavigator from '../navigation/TabNavigator';
import Dashboard from '../screens/dashboard/DashboardScreen';
import Barang from '../screens/barang/BarangScreen';
import Transaksi from '../screens/transaksi/TransaksiScreen';
import Prediksi from '../screens/prediksi/PrediksiScreen';
import Pengaturan from '../screens/pengaturan/PengaturanScreen';
import { MainLayoutProps } from '../types/types';

const MainLayout: React.FC<MainLayoutProps> = ({ activeTab: initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const getTabData = () => {
    switch (activeTab) {
      case 'Dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Ringkasan Hari Ini',
          content: <Dashboard />,
        };
      case 'Barang':
        return {
          title: 'Barang',
          subtitle: 'Daftar Barang',
          content: <Barang />,
        };
      case 'Transaksi':
        return {
          title: 'Transaksi',
          subtitle: 'Catat Penjualan',
          content: <Transaksi />,
        };
      case 'Prediksi':
        return {
          title: 'Prediksi',
          subtitle: 'ML Forecast',
          content: <Prediksi />,
        };
      case 'Pengaturan':
        return {
          title: 'Pengaturan',
          subtitle: 'Konfigurasi Aplikasi',
          content: <Pengaturan />,
        };
      default:
        return {
          title: 'Aplikasi',
          subtitle: 'Toko Kelontong',
          content: <></>,
        };
    }
  };

  const { title, subtitle, content } = getTabData();

  return (
    <View style={styles.container}>
      <Header title={title} subtitle={subtitle} />
      <ScrollView style={styles.content}>{content}</ScrollView>
      <TabNavigator activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    // paddingTop: 10,
    // paddingBottom: 70,
    // paddingHorizontal: 16,
    // paddingVertical: 10,
  },
});

export default MainLayout;
