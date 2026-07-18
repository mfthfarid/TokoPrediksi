import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Home,
  Package,
  Receipt,
  LineChart,
  Settings,
} from 'lucide-react-native';
import { Colors } from '../../styles';

// Peta nama route (dari BottomTabParamList) ke label & icon yang ditampilkan
const TAB_CONFIG: Record<string, { label: string; icon: typeof Home }> = {
  DashboardTab: { label: 'Dashboard', icon: Home },
  BarangTab: { label: 'Barang', icon: Package },
  TransaksiTab: { label: 'Transaksi', icon: Receipt },
  PrediksiTab: { label: 'Prediksi', icon: LineChart },
  PengaturanTab: { label: 'Pengaturan', icon: Settings },
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.navbar}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const isActive = state.index === index;
        const Icon = config.icon;

        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.navItem}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Icon size={25} color={isActive ? Colors.primary : '#9e9e9e'} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
