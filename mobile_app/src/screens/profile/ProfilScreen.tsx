import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout'; // Sesuaikan path Anda
import PrimaryButton from '../../components/ui/PrimaryButton'; // Sesuaikan path Anda
import PasswordField from '../../components/ui/PasswordField';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama lengkap"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Alamat Email</Text>
          <View
            style={[
              styles.inputContainer,
              emailError ? styles.inputErrorBorder : null,
            ]}
          >
            <Mail size={18} color="#9e9e9e" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={validateEmail}
              placeholder="Masukkan alamat email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
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

        <PasswordField
          label="Password Saat Ini"
          placeholder="Masukkan password lama"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          leftIcon={<Lock size={20} color={Colors.textSecondary} />}
        />
        <PasswordField
          label="Password Baru"
          placeholder="Masukkan password baru"
          value={newPassword}
          onChangeText={setNewPassword}
          leftIcon={<Lock size={20} color={Colors.textSecondary} />}
        />
        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Kata Sandi Saat Ini</Text>
          <View style={styles.inputContainer}>
            <Lock size={18} color="#9e9e9e" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Masukkan kata sandi lama"
              secureTextEntry
            />
          </View>
        </View> */}

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Kata Sandi Baru</Text>
          <View style={styles.inputContainer}>
            <Lock size={18} color="#9e9e9e" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Masukkan kata sandi baru"
              secureTextEntry
            />
          </View>
        </View> */}
      </View>
    </ScreenLayout>
  );
};

export default EditProfilScreen;
