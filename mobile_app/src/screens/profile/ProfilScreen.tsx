import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout'; // Sesuaikan path Anda
import PrimaryButton from '../../components/ui/PrimaryButton'; // Sesuaikan path Anda
import PasswordField from '../../components/ui/PasswordField';
import TextField from '../../components/ui/TextField';
import { Colors } from '../../styles'; // Sesuaikan path Anda
import styles from './styles';

const EditProfilScreen = () => {
  const navigation = useNavigation();

  // State untuk form
  const [name, setName] = useState('Budi Kasir');
  const [email, setEmail] = useState('budi@tokoprediksi.com');
  const [emailError, setEmailError] = useState('');

  // State untuk keamanan (opsional)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  // const [password, setPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');

  // State loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi Validasi Email Real-time
  const validateEmail = (text: string) => {
    setEmail(text);
    // Regex sederhana untuk mengecek format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError('Format email tidak valid (contoh: nama@email.com)');
    } else {
      setEmailError('');
    }
  };

  // Fungsi Simpan Perubahan
  const handleSave = () => {
    if (emailError) {
      Alert.alert('Gagal', 'Silakan perbaiki format email terlebih dahulu.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      Alert.alert('Gagal', 'Nama dan Email tidak boleh kosong.');
      return;
    }

    // Mulai animasi loading
    setIsSubmitting(true);

    // Simulasi proses ke Backend (API Call)
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Berhasil', 'Profil Anda berhasil diperbarui!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500); // Simulasi delay 1.5 detik
  };

  return (
    <ScreenLayout
      title="Profil & Akun"
      subtitle="Kelola informasi pribadi dan keamanan akun Anda"
      // Memanfaatkan prop footer yang pernah kita diskusikan (Sticky Footer)
      footer={
        <View style={styles.footerContainer}>
          <PrimaryButton
            title={isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            onPress={handleSave}
            disabled={isSubmitting || emailError.length > 0}
            loading={isSubmitting} // Asumsi PrimaryButton Anda mendukung prop loading
          />
        </View>
      }
    >
      {/* Kartu Informasi Pribadi */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <User size={20} color={Colors.primary} />
          <Text style={styles.cardTitle}>Informasi Pribadi</Text>
        </View>

        {/* Menggunakan TextField agar konsisten */}
        <View style={styles.fieldWrapper}>
          <TextField
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <TextField
            label="Alamat Email"
            placeholder="Masukkan alamat email"
            value={email}
            onChangeText={validateEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.textSecondary} />}
          />
          {/* Teks Peringatan Validasi Real-time */}
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>
      </View>

      {/* Kartu Keamanan Akun */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <ShieldCheck size={20} color={Colors.primary} />
          <Text style={styles.cardTitle}>Keamanan Akun (Opsional)</Text>
        </View>
        <Text style={styles.cardDescription}>
          Kosongkan bagian ini jika Anda tidak ingin mengubah kata sandi.
        </Text>

        <View style={styles.fieldWrapper}>
          <PasswordField
            label="Password Saat Ini"
            placeholder="Masukkan password lama"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            leftIcon={<Lock size={20} color={Colors.textSecondary} />}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <PasswordField
            label="Password Baru"
            placeholder="Masukkan password baru"
            value={newPassword}
            onChangeText={setNewPassword}
            leftIcon={<Lock size={20} color={Colors.textSecondary} />}
          />
        </View>
      </View>
    </ScreenLayout>
  );
};

export default EditProfilScreen;
