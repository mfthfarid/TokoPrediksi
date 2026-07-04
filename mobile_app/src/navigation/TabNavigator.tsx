// mobile/components/TabNavigator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TabNavigatorProps } from '../types/types';

export default function TabNavigator({
  activeTab,
  setActiveTab,
}: TabNavigatorProps) {
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'Barang', label: 'Barang', icon: 'package-variant' },
    { id: 'Transaksi', label: 'Transaksi', icon: 'receipt' },
    { id: 'Prediksi', label: 'Prediksi', icon: 'chart-line' },
    { id: 'Pengaturan', label: 'Pengaturan', icon: 'cog-outline' },
  ];

  return (
    <View style={styles.navbar}>
      {navItems.map(item => {
        const isActive = activeTab === item.id;

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => setActiveTab(item.id)}
            activeOpacity={0.7}
          >
            <Icon
              name={item.icon}
              size={25}
              color={isActive ? '#355affff' : '#9e9e9e'}
            />

            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
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

  navItemActive: {},

  navLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },

  navLabelActive: {
    color: '#355affff',
    fontWeight: '600',
  },
});
