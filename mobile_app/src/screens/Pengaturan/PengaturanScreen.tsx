import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenLayout from '../../layouts/ScreenLayout';
import { PengaturanStyles } from './PengaturanStyles';
import { useAuth } from '../../contexts/AuthContext';

const PengaturanScreen = () => {
  const { isBiometricEnabled, enableBiometric, disableBiometric } = useAuth();
  const [toggling, setToggling] = useState(false);

  const handleToggleBiometric = async (value: boolean) => {
    setToggling(true);
    try {
      if (value) {
        const success = await enableBiometric();
        if (!success) {
          Alert.alert(
            'Gagal Mengaktifkan',
            'Sidik jari tidak tersedia di perangkat ini, atau verifikasi dibatalkan.',
          );
        }
      } else {
        await disableBiometric();
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <ScreenLayout title="Pengaturan" subtitle="Konfigurasi Aplikasi">
      {/* Bagian Toko */}
      <View style={PengaturanStyles.settingsSection}>
        <Text style={PengaturanStyles.settingsSectionTitle}>Toko</Text>
        <TouchableOpacity style={PengaturanStyles.settingItem}>
          <Icon name="store" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Informasi Toko</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Bagian Keamanan */}
      <View style={PengaturanStyles.settingsSection}>
        <Text style={PengaturanStyles.settingsSectionTitle}>Keamanan</Text>
        <View style={PengaturanStyles.settingItem}>
          <Icon name="fingerprint" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Login Fingerprint</Text>
          <Switch
            value={isBiometricEnabled}
            onValueChange={handleToggleBiometric}
            disabled={toggling}
          />
        </View>
      </View>

      {/* Bagian Data */}
      <View style={PengaturanStyles.settingsSection}>
        <Text style={PengaturanStyles.settingsSectionTitle}>Data</Text>
        <TouchableOpacity style={PengaturanStyles.settingItem}>
          <Icon name="cloud-upload" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Backup Data</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

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
    </ScreenLayout>
  );
};

export default PengaturanScreen;
