import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { User, Mail, Lock, Edit2 } from 'lucide-react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import TextField from '../../components/ui/TextField';
import PasswordField from '../../components/ui/PasswordField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { Colors } from '../../styles';
import {
  getCurrentUser,
  updateProfile,
  updatePassword,
} from '../../services/userService';
import { extractErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../contexts/ToastContext';
import styles from './styles';

const ProfilScreen = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  // UX State untuk Profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  // Bagian profil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // UX State untuk Password
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Bagian password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCurrentUser();
        setName(response.data.name);
        setEmail(response.data.email);
        setOriginalName(response.data.name);
        setOriginalEmail(response.data.email);
      } catch (error) {
        toast.error('Gagal memuat data profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelProfileEdit = () => {
    setName(originalName);
    setEmail(originalEmail);
    setIsEditingProfile(false);
  };

  const handleCancelPasswordEdit = () => {
    // Kosongkan form password jika batal
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditingPassword(false);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Periksa Kembali', 'Nama tidak boleh kosong');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Periksa Kembali', 'Email tidak boleh kosong');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await updateProfile({
        name: name.trim(),
        email: email.trim(),
      });
      setName(response.data.name);
      setEmail(response.data.email);
      setOriginalName(response.data.name);
      setOriginalEmail(response.data.email);

      toast.success('Profil berhasil diperbarui');
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Gagal memperbarui profil'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Periksa Kembali', 'Semua kolom password wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Periksa Kembali', 'Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Periksa Kembali', 'Konfirmasi password tidak cocok');
      return;
    }

    setSavingPassword(true);
    try {
      await updatePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success('Password berhasil diubah');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false); // Kunci form password setelah sukses
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Gagal mengubah password'));
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout title="Profil" subtitle="Akun & Keamanan">
      {/* KARTU PROFIL */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Informasi Akun</Text>
          {!isEditingProfile && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditingProfile(true)}
            >
              <Edit2 size={14} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextField
          label="Nama"
          placeholder="Nama lengkap"
          value={name}
          onChangeText={setName}
          editable={isEditingProfile}
          leftIcon={
            <User
              size={18}
              color={isEditingProfile ? Colors.primary : Colors.textSecondary}
            />
          }
        />

        <TextField
          label="Email"
          placeholder="Alamat email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={isEditingProfile}
          leftIcon={
            <Mail
              size={18}
              color={isEditingProfile ? Colors.primary : Colors.textSecondary}
            />
          }
        />

        {isEditingProfile && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelProfileEdit}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <View style={styles.saveButtonContainer}>
              <PrimaryButton
                title="Simpan"
                loadingTitle="Menyimpan..."
                loading={savingProfile}
                onPress={handleSaveProfile}
              />
            </View>
          </View>
        )}
      </View>

      {/* KARTU GANTI PASSWORD */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Ganti Password</Text>
          {!isEditingPassword && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditingPassword(true)}
            >
              <Edit2 size={14} color={Colors.primary} />
              <Text style={styles.editButtonText}>Ubah</Text>
            </TouchableOpacity>
          )}
        </View>

        <PasswordField
          label="Password Lama"
          placeholder={
            isEditingPassword ? 'Masukkan password lama' : '••••••••'
          }
          value={oldPassword}
          onChangeText={setOldPassword}
          editable={isEditingPassword}
          leftIcon={
            <Lock
              size={18}
              color={isEditingPassword ? Colors.primary : Colors.textSecondary}
            />
          }
        />

        <PasswordField
          label="Password Baru"
          placeholder={isEditingPassword ? 'Minimal 6 karakter' : '••••••••'}
          value={newPassword}
          onChangeText={setNewPassword}
          editable={isEditingPassword}
          leftIcon={
            <Lock
              size={18}
              color={isEditingPassword ? Colors.primary : Colors.textSecondary}
            />
          }
        />

        <PasswordField
          label="Konfirmasi Password Baru"
          placeholder={isEditingPassword ? 'Ulangi password baru' : '••••••••'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={isEditingPassword}
          leftIcon={
            <Lock
              size={18}
              color={isEditingPassword ? Colors.primary : Colors.textSecondary}
            />
          }
        />

        {isEditingPassword && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelPasswordEdit}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <View style={styles.saveButtonContainer}>
              <PrimaryButton
                title="Simpan"
                loadingTitle="Menyimpan..."
                loading={savingPassword}
                onPress={handleChangePassword}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};

export default ProfilScreen;
