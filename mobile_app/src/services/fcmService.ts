import { Platform, PermissionsAndroid } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { registerFcmToken } from './notificationService';

// Dipanggil setelah login berhasil (dan sekali lagi tiap app dibuka
// selama masih login, jaga-jaga token FCM berubah/expired).
export const setupPushNotifications = async (): Promise<void> => {
  try {
    const messagingInstance = getMessaging();

    // Android 13+ butuh izin runtime terpisah dari izin Firebase sendiri
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    const authStatus = await requestPermission(messagingInstance);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Izin push notification ditolak user');
      return;
    }

    const token = await getToken(messagingInstance);
    if (token) {
      await registerFcmToken(token);
    }
  } catch (error) {
    // Gagal setup push notification bukan hal fatal - jangan sampai
    // ganggu alur login utama cuma gara-gara ini.
    console.error('Setup push notification error:', error);
  }
};

// Panggil sekali di App.tsx (di luar komponen manapun) - jaga-jaga token
// FCM berubah sendiri (device di-restore, app di-reinstall, dst), auto
// daftarkan ulang ke backend tanpa perlu user login ulang.
export const listenTokenRefresh = (): (() => void) => {
  return onTokenRefresh(getMessaging(), async token => {
    try {
      await registerFcmToken(token);
    } catch (error) {
      console.error('Gagal daftar ulang FCM token:', error);
    }
  });
};
