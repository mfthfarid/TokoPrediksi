import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import NotifikasiScreen from '../../screens/notifikasi/NotifikasiScreen';
import KategoriScreen from '../../screens/kategori/KategoriScreen';
import SupplierScreen from '../../screens/supplier/SupplierScreen';
import PembelianScreen from '../../screens/pembelian/PembelianScreen';
import TambahPembelianScreen from '../../screens/pembelian/tambah/TambahPembelianScreen';
import DetailPembelianScreen from '../../screens/pembelian/detail/DetailPembelianScreen';
import PenyesuaianStokScreen from '../../screens/penyesuaian-stok/PenyesuaianStokScreen';
import TambahPenyesuaianScreen from '../../screens/penyesuaian-stok/tambah/TambahPenyesuaianScreen';
import RiwayatPenyesuaianScreen from '../../screens/penyesuaian-stok/riwayat/RiwayatPenyesuaianScreen';
import { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      {/* Notifikasi pakai header bawaan karena screen sederhana tanpa
          ScreenLayout. Kategori TIDAK - dia sudah pakai ScreenLayout
          sendiri (ada Header di dalamnya), jadi headerShown harus false
          di sini supaya tidak dobel. */}
      <Stack.Screen
        name="Notifikasi"
        component={NotifikasiScreen}
        options={{ headerShown: true, title: 'Notifikasi' }}
      />
      <Stack.Screen name="Kategori" component={KategoriScreen} />
      <Stack.Screen name="Supplier" component={SupplierScreen} />
      <Stack.Screen name="Pembelian" component={PembelianScreen} />
      <Stack.Screen name="TambahPembelian" component={TambahPembelianScreen} />
      <Stack.Screen name="DetailPembelian" component={DetailPembelianScreen} />
      <Stack.Screen name="PenyesuaianStok" component={PenyesuaianStokScreen} />
      <Stack.Screen
        name="TambahPenyesuaian"
        component={TambahPenyesuaianScreen}
      />
      <Stack.Screen
        name="RiwayatPenyesuaian"
        component={RiwayatPenyesuaianScreen}
      />
    </Stack.Navigator>
  );
}
