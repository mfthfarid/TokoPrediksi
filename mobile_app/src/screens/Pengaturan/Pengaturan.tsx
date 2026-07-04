// mobile/screens/Pengaturan.tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PengaturanStyles } from './PengaturanStyles';

const Pengaturan = () => {
  return (
    <ScrollView style={PengaturanStyles.container}>
      {/* Bagian Toko */}
      <View style={PengaturanStyles.settingsSection}>
        <Text style={PengaturanStyles.settingsSectionTitle}>Toko</Text>
        <TouchableOpacity style={PengaturanStyles.settingItem}>
          <Icon name="store" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Informasi Toko</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Bagian Data */}
      <View style={PengaturanStyles.settingsSection}>
        <Text style={PengaturanStyles.settingsSectionTitle}>Data</Text>
        {/* Backup Data */}
        <TouchableOpacity style={PengaturanStyles.settingItem}>
          <Icon name="cloud-upload" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Backup Data</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Export Laporan */}
        <TouchableOpacity style={PengaturanStyles.settingItem}>
          <Icon name="file-export" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Export Laporan</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Bagian Tentang */}
      <View style={PengaturanStyles.settingsSection}>
        <Text style={PengaturanStyles.settingsSectionTitle}>Tentang</Text>
        <View style={PengaturanStyles.settingItem}>
          <Icon name="information" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Versi Aplikasi</Text>
          <Text style={PengaturanStyles.settingVersion}>v1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Pengaturan;
