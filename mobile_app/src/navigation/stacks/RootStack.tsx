import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../../screens/splash/SplashScreen';
import AuthStack from './AuthStack';
import BottomTabs from '../tabs/BottomTabs';

import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  const { isLoading, isLocked, isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {isLoading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : isAuthenticated && !isLocked ? (
        <Stack.Screen name="Main" component={BottomTabs} />
      ) : (
        // isLocked ikut ke sini -> LoginScreen sendiri yang menampilkan
        // tombol fingerprint berdasarkan isLocked dari useAuth()
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
