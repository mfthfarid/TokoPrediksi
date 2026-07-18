import * as Keychain from 'react-native-keychain';

// 'service' dipakai sebagai namespace supaya tidak bentrok dengan credential lain
const SERVICE_NAME = 'tokoprediksi_auth_token';

export const getToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error('Gagal membaca token:', error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    // Username diisi placeholder karena yang penting cuma field password (token)
    await Keychain.setGenericPassword('tokoprediksi_user', token, {
      service: SERVICE_NAME,
    });
  } catch (error) {
    console.error('Gagal menyimpan token:', error);
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
  } catch (error) {
    console.error('Gagal menghapus token:', error);
  }
};
