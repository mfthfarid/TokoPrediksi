import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BarangScreen from '../../screens/barang/BarangScreen';
import TambahBarangScreen from '../../screens/barang/tambah/TambahBarangScreen';
import DetailBarangScreen from '../../screens/barang/detail/DetailBarangScreen';
import { BarangStackParamList } from '../types';

const Stack = createNativeStackNavigator<BarangStackParamList>();

export default function BarangStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Barang" component={BarangScreen} />
      <Stack.Screen name="TambahBarang" component={TambahBarangScreen} />
      <Stack.Screen name="DetailBarang" component={DetailBarangScreen} />
    </Stack.Navigator>
  );
}
