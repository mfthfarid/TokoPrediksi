import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  RouteProp,
} from '@react-navigation/native';
import DashboardStack from '../stacks/DashboardStack';
import BarangStack from '../stacks/BarangStack';
import TransaksiStack from '../stacks/TransaksiStack';
import PrediksiStack from '../stacks/PrediksiStack';
import PengaturanStack from '../stacks/PengaturanStack';
import CustomTabBar from './CustomTabBar';
import { BottomTabParamList } from '../types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const HIDDEN_TABBAR_ROUTES = [
  'Kategori',
  'Supplier',
  'Pembelian',
  'TambahPembelian',
];

const getDashboardTabBarStyle = (
  route: RouteProp<BottomTabParamList, 'DashboardTab'>,
) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Dashboard';
  if (HIDDEN_TABBAR_ROUTES.includes(routeName)) {
    return { display: 'none' as const };
  }
  return undefined;
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={({ route }) => ({
          tabBarStyle: getDashboardTabBarStyle(route),
        })}
      />
      <Tab.Screen name="BarangTab" component={BarangStack} />
      <Tab.Screen name="TransaksiTab" component={TransaksiStack} />
      <Tab.Screen name="PrediksiTab" component={PrediksiStack} />
      <Tab.Screen name="PengaturanTab" component={PengaturanStack} />
    </Tab.Navigator>
  );
}
