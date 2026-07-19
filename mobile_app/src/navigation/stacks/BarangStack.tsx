import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BarangScreen from '../../screens/barang/BarangScreen';
import TambahBarangScreen from '../../screens/barang/tambah/TambahBarangScreen';
import { BarangStackParamList } from '../types';

const Stack = createNativeStackNavigator<BarangStackParamList>();

export default function BarangStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Barang" component={BarangScreen} />
      <Stack.Screen name="TambahBarang" component={TambahBarangScreen} />
      {/* TODO: tambahkan saat screen-nya sudah dibuat, dan tambahkan
          route-nya juga di BarangStackParamList (navigation/types.ts):
      <Stack.Screen name="DetailBarang" component={DetailBarangScreen} />
      <Stack.Screen name="EditBarang" component={EditBarangScreen} /> */}
    </Stack.Navigator>
  );
}
