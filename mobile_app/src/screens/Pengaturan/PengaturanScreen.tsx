import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenLayout from '../../layouts/ScreenLayout';
import { PengaturanStyles } from './PengaturanStyles'; // Asumsi style di-import dari file terpisah
import { useAuth } from '../../contexts/AuthContext';

const PengaturanScreen = () => {
  const { isBiometricEnabled, enableBiometric, disableBiometric, logout } =
    useAuth();
  const [toggling, setToggling] = useState(false);

  // State sementara untuk toggle notifikasi (Nanti bisa dihubungkan ke AsyncStorage/Backend)
  const [notifStok, setNotifStok] = useState(true);
  const [notifExpired, setNotifExpired] = useState(true);

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

  const handleLogout = () => {
    Alert.alert(
      'Keluar Aplikasi',
      'Apakah kamu yakin ingin keluar? Kamu perlu login ulang untuk masuk lagi.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => logout() },
      ],
    );
  };

  return (
    <ScreenLayout title="Pengaturan" subtitle="Konfigurasi Aplikasi">
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

      {/* Bagian Notifikasi (Poin 3) */}
      <View style={PengaturanStyles.settingsSection}>
        <Text style={PengaturanStyles.settingsSectionTitle}>
          Preferensi Notifikasi
        </Text>

        <View style={PengaturanStyles.settingItem}>
          <Icon name="bell-alert-outline" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>
            Peringatan Stok Menipis
          </Text>
          <Switch value={notifStok} onValueChange={setNotifStok} />
        </View>

        <View style={PengaturanStyles.settingItem}>
          <Icon name="calendar-alert" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>
            Peringatan Kedaluwarsa
          </Text>
          <Switch value={notifExpired} onValueChange={setNotifExpired} />
        </View>
      </View>

      {/* Bagian Tentang (Poin 4) */}
      <View style={PengaturanStyles.settingsSection}>
        <Text style={PengaturanStyles.settingsSectionTitle}>
          Informasi & Dukungan
        </Text>

        {/* Tombol Pusat Bantuan */}
        <TouchableOpacity style={PengaturanStyles.settingItem}>
          <Icon name="help-circle-outline" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Pusat Bantuan / FAQ</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Informasi Versi */}
        <View style={PengaturanStyles.settingItem}>
          <Icon name="information-outline" size={24} color="#666" />
          <Text style={PengaturanStyles.settingText}>Versi Aplikasi</Text>
          <Text style={PengaturanStyles.settingVersion}>v1.0.0</Text>
        </View>
      </View>

      {/* Tombol Keluar */}
      <TouchableOpacity
        style={PengaturanStyles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Icon name="logout" size={20} color="#dc2626" />
        <Text style={PengaturanStyles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
};

export default PengaturanScreen;
