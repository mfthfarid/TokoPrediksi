import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardStack from '../stacks/DashboardStack';
import BarangStack from '../stacks/BarangStack';
import TransaksiStack from '../stacks/TransaksiStack';
import PrediksiStack from '../stacks/PrediksiStack';
import PengaturanStack from '../stacks/PengaturanStack';
import CustomTabBar from './CustomTabBar';
import { BottomTabParamList } from '../types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStack} />
      <Tab.Screen name="BarangTab" component={BarangStack} />
      <Tab.Screen name="TransaksiTab" component={TransaksiStack} />
      <Tab.Screen name="PrediksiTab" component={PrediksiStack} />
      <Tab.Screen name="PengaturanTab" component={PengaturanStack} />
    </Tab.Navigator>
  );
}
