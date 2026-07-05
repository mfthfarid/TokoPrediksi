import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../../screens/splash/SplashScreen';
import AuthStack from './AuthStack';

import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  const isLoggedIn = false;

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />

      {!isLoggedIn && <Stack.Screen name="Auth" component={AuthStack} />}
    </Stack.Navigator>
  );
}
