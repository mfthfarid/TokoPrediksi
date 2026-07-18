import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransaksiScreen from '../../screens/transaksi/TransaksiScreen';
import { TransaksiStackParamList } from '../types';

const Stack = createNativeStackNavigator<TransaksiStackParamList>();

export default function TransaksiStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Transaksi" component={TransaksiScreen} />
    </Stack.Navigator>
  );
}
