import React, { useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Text,
  View,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Checkbox } from 'react-native-paper';
import { Mail, Lock } from 'lucide-react-native';
import TextField from '../../../components/ui/TextField';
import PasswordField from '../../../components/ui/PasswordField';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import styles from './styles';
import { Images } from '../../../assets';
import { Colors } from '../../../styles';

// nanti kita ganti menjadi Images.logo
// const logo = require('../../../assets/images/logo.png');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    // simulasi request API
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Image
            source={Images.logo}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Silakan login untuk melanjutkan</Text>
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

          <View style={styles.rememberContainer}>
            <Switch
              value={remember}
              onValueChange={setRemember}
              trackColor={{
                false: '#d1d5db',
                true: Colors.primary,
              }}
            />
            {/* <Checkbox
              status={remember ? 'checked' : 'unchecked'}
              onPress={() => setRemember(!remember)}
            /> */}

            <Text style={styles.rememberText}>Ingat Saya</Text>
          </View>

          <PrimaryButton
            title="Masuk"
            loadingTitle="Sedang Masuk..."
            loading={loading}
            onPress={handleLogin}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
