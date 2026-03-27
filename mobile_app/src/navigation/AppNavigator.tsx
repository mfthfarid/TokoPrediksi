// mobile/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from '../screens/Dashboard';
import Notifikasi from '../screens/Notifikasi';
import { RootStackParamList } from '../types/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifikasi"
          component={Notifikasi}
          options={{ title: 'Notifikasi' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
