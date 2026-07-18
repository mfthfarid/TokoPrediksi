import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@tokoprediksi_biometric_enabled';

export const getBiometricPreference = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Gagal membaca preferensi biometric:', error);
    return false;
  }
};

export const setBiometricPreference = async (
  enabled: boolean,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      BIOMETRIC_ENABLED_KEY,
      enabled ? 'true' : 'false',
    );
  } catch (error) {
    console.error('Gagal menyimpan preferensi biometric:', error);
  }
};
