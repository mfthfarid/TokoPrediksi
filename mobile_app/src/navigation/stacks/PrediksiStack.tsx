import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PrediksiScreen from '../../screens/prediksi/PrediksiScreen';
import { PrediksiStackParamList } from '../types';

const Stack = createNativeStackNavigator<PrediksiStackParamList>();

export default function PrediksiStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Prediksi" component={PrediksiScreen} />
    </Stack.Navigator>
  );
}
