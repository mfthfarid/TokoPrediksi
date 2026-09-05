import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_ENABLED_KEY = '@tokoprediksi_notification_enabled';

export const getNotificationPreference = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Gagal membaca preferensi notifikasi:', error);
    return false;
  }
};

export const setNotificationPreference = async (
  enabled: boolean,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_ENABLED_KEY,
      enabled ? 'true' : 'false',
    );
  } catch (error) {
    console.error('Gagal menyimpan preferensi notifikasi:', error);
  }
};
