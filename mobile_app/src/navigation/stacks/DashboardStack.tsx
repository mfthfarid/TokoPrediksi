import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import NotifikasiScreen from '../../screens/notifikasi/NotifikasiScreen';
import KategoriScreen from '../../screens/kategori/KategoriScreen';
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
    </Stack.Navigator>
  );
}
