import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  getToken,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { registerFcmToken } from './notificationService';

export const enablePushNotifications = async (): Promise<boolean> => {
  try {
    const messagingInstance = getMessaging();
    // Android 13+
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[FCM] Izin notifikasi ditolak');
        return false;
      }
    }

    console.log('[FCM] Mengambil token...');
    const token = await getToken(messagingInstance);
    console.log('[FCM] Token:', token);
    if (!token) {
      return false;
    }

    await registerFcmToken(token);
    console.log('[FCM] Token berhasil dikirim ke backend');
    return true;
  } catch (error) {
    console.error('[FCM] Gagal mengaktifkan push notification:', error);
    return false;
  }
};

export const listenTokenRefresh = (): (() => void) => {
  return onTokenRefresh(getMessaging(), async token => {
    try {
      await registerFcmToken(token);
      console.log('[FCM] Token berhasil diperbarui');
    } catch (error) {
      console.error('[FCM] Gagal daftar ulang token:', error);
    }
  });
};
