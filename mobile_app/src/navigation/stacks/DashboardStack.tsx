import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import NotifikasiScreen from '../../screens/notifikasi/NotifikasiScreen';
import { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      {/* Notifikasi pakai header bawaan (bukan ScreenLayout) karena ini
          halaman "push" dengan tombol back, beda konteks dari tab utama */}
      <Stack.Screen
        name="Notifikasi"
        component={NotifikasiScreen}
        options={{ headerShown: true, title: 'Notifikasi' }}
      />
    </Stack.Navigator>
  );
}
