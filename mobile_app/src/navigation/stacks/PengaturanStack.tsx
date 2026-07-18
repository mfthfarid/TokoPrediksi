import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PengaturanScreen from '../../screens/pengaturan/PengaturanScreen';
import { PengaturanStackParamList } from '../types';

const Stack = createNativeStackNavigator<PengaturanStackParamList>();

export default function PengaturanStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pengaturan" component={PengaturanScreen} />
    </Stack.Navigator>
  );
}
