import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock, Fingerprint } from 'lucide-react-native';
import AuthLayout from '../../../layouts/AuthLayout';
import TextField from '../../../components/ui/TextField';
import PasswordField from '../../../components/ui/PasswordField';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import styles from './styles';
import { Colors } from '../../../styles';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthStackParamList } from '../../../navigation/types';

type LoginNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login, isLocked, unlockWithBiometric } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi');
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      await login(email, password);
      // Tidak perlu navigate manual -> RootStack otomatis pindah
      // ke Main begitu isAuthenticated jadi true & isLocked false
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Email atau password salah. Silakan coba lagi.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintPress = async () => {
    setErrorMessage(null);
    setBiometricLoading(true);
    const success = await unlockWithBiometric();
    if (!success) {
      setErrorMessage(
        'Sidik jari tidak dikenali atau dibatalkan. Coba lagi atau masuk pakai password.',
      );
    }
    setBiometricLoading(false);
  };

  return (
    <AuthLayout
      title="Selamat Datang"
      subtitle="Silakan login untuk melanjutkan"
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

      <PasswordField
        label="Password"
        placeholder="Masukkan password"
        value={password}
        onChangeText={setPassword}
        leftIcon={<Lock size={20} color={Colors.textSecondary} />}
      />

      <TouchableOpacity
        style={styles.forgotLink}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.forgotLinkText}>Lupa Password?</Text>
      </TouchableOpacity>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.actionRow}>
        <View style={styles.loginButtonWrapper}>
          <PrimaryButton
            title="Masuk"
            loadingTitle="Sedang Masuk..."
            loading={loading}
            onPress={handleLogin}
          />
        </View>

        {isLocked && (
          <TouchableOpacity
            style={styles.fingerprintButton}
            onPress={handleFingerprintPress}
            disabled={biometricLoading}
            activeOpacity={0.7}
          >
            <Fingerprint
              size={26}
              color={biometricLoading ? Colors.textSecondary : Colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </AuthLayout>
  );
};

export default LoginScreen;
