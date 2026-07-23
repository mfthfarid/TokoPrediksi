import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useDoubleBackExit } from '../../hooks/useDoubleBackExit';
import ScreenLayout from '../../layouts/ScreenLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useToast } from '../../contexts/ToastContext';

const Dashboard = () => {
  useDoubleBackExit();
  const toast = useToast();

  // Fungsi khusus untuk testing animasi toast berulang kali
  const handleTestToastError = () => {
    // 🚧 Ganti Alert.alert ini dengan fungsi pemanggil Toast custom Anda
    // Contoh jika menggunakan custom state:
    // setVisibleToast(true); setAnimasiToast(...);

    toast.error('Barang tersimpan, tapi foto gagal diupload');
  };

  return (
    <ScreenLayout
      title="Dashboard"
      subtitle="Selamat datang di halaman dashboard"
    >
      <Text>Ini adalah halaman dashboard</Text>
      {/* --- AREA DEBUGGING: HAPUS SEBELUM RILIS --- */}
      <View
        style={{
          marginVertical: 16,
          padding: 12,
          backgroundColor: '#ffebee',
          borderWidth: 1,
          borderColor: '#ffcdd2',
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            marginBottom: 8,
            fontWeight: 'bold',
            color: '#c62828',
            fontSize: 12,
          }}
        >
          🚧 AREA DEBUGGING (JANGAN LUPA DIHAPUS)
        </Text>

        <PrimaryButton
          title="🔧 Test Animasi Toast Error"
          onPress={handleTestToastError}
          // Jika PrimaryButton Anda punya props tipe warna, bisa diset ke warna bahaya/merah
        />
      </View>
      {/* ------------------------------------------- */}
    </ScreenLayout>

    // <View style={{ flex: 1 }}>
    //   <Text>Ini adalah halaman dashboard</Text>
    //   <Text>Header dan TabNavigator sekarang muncul!</Text>
    // </View>
  );
};

export default Dashboard;
