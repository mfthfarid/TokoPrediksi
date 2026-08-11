import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PengaturanScreen from '../../screens/pengaturan/PengaturanScreen';
import ProfilScreen from '../../screens/profile/ProfilScreen';
import { PengaturanStackParamList } from '../types';

const Stack = createNativeStackNavigator<PengaturanStackParamList>();

export default function PengaturanStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pengaturan" component={PengaturanScreen} />
      <Stack.Screen name="Profil" component={ProfilScreen} />
    </Stack.Navigator>
  );
}
