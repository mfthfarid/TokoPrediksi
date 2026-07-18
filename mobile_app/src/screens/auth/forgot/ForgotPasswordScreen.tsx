import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, KeyRound, Lock } from 'lucide-react-native';
import AuthLayout from '../../../layouts/AuthLayout';
import TextField from '../../../components/ui/TextField';
import PasswordField from '../../../components/ui/PasswordField';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import styles from './styles';
import { Colors } from '../../../styles';
import {
  requestPasswordReset,
  resetPassword,
} from '../../../services/authService';
import { AuthStackParamList } from '../../../navigation/types';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

type Step = 'email' | 'reset';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [step, setStep] = useState<Step>('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    if (!email) {
      setErrorMessage('Email wajib diisi');
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setInfoMessage(`Kode OTP telah dikirim ke ${email}`);
      setStep('reset');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Gagal mengirim OTP. Pastikan email terdaftar.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMessage('Semua kolom wajib diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok');
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      await resetPassword({
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      // Sukses -> balik ke Login (cuma 1 entry yang di-push dari Login)
      navigation.goBack();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Gagal reset password. Cek kembali kode OTP kamu.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setErrorMessage(null);
    setInfoMessage(null);
    setOtp('');
  };

  if (step === 'email') {
    return (
      <AuthLayout
        title="Lupa Password"
        subtitle="Masukkan email untuk menerima kode OTP"
      >
        <TextField
          label="Email"
          placeholder="Masukkan email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Mail size={20} color={Colors.textSecondary} />}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <PrimaryButton
          title="Kirim Kode OTP"
          loadingTitle="Mengirim..."
          loading={loading}
          onPress={handleRequestOtp}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Masukkan kode OTP dan password baru kamu"
    >
      {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

      <TextField
        label="Kode OTP"
        placeholder="Masukkan kode OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        leftIcon={<KeyRound size={20} color={Colors.textSecondary} />}
      />

      <PasswordField
        label="Password Baru"
        placeholder="Masukkan password baru"
        value={newPassword}
        onChangeText={setNewPassword}
        leftIcon={<Lock size={20} color={Colors.textSecondary} />}
      />

      <PasswordField
        label="Konfirmasi Password"
        placeholder="Ulangi password baru"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        leftIcon={<Lock size={20} color={Colors.textSecondary} />}
      />

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <PrimaryButton
        title="Reset Password"
        loadingTitle="Memproses..."
        loading={loading}
        onPress={handleResetPassword}
      />

      <TouchableOpacity
        style={styles.changeEmailLink}
        onPress={handleChangeEmail}
      >
        <Text style={styles.changeEmailText}>
          Ganti email / kirim ulang OTP
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;
