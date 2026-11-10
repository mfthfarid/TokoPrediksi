import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { getNotifications } from '../services/notificationService';
import {
  getNotificationPreference,
  setNotificationPreference,
} from '../services/notificationPreference';
import {
  enablePushNotifications,
  reRegisterFcmToken,
  listenTokenRefresh,
} from '../services/fcmService';
import { getToken } from '../services/tokenStorage';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  isNotificationEnabled: boolean;
  isNotificationLoading: boolean;
  refreshUnreadCount: () => Promise<void>;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await getNotifications();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      // Gagal ambil unread count bukan hal fatal (misal belum login)
      console.log('[Notification] Info unread count belum tersedia');
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const enabled = await getNotificationPreference();
      setIsNotificationEnabled(enabled);
      setIsNotificationLoading(false);
      await refreshUnreadCount();

      // Re-registrasi token FCM secara silent jika user pernah mengaktifkan dan sudah login
      if (enabled) {
        try {
          const authToken = await getToken();
          if (authToken) {
            await reRegisterFcmToken();
            console.log('[FCM] Token berhasil di-re-registrasi saat bootstrap');
          } else {
            console.log('[FCM] Skip re-registrasi: user belum login');
          }
        } catch (e) {
          console.log('[FCM] Re-registrasi token gagal:', e);
        }
      }
    };
    bootstrap();
  }, [refreshUnreadCount]);

  // Dengarkan token refresh dari Firebase (token bisa berubah sewaktu-waktu)
  useEffect(() => {
    const unsubscribeRefresh = listenTokenRefresh();
    return unsubscribeRefresh;
  }, []);

  // Saat user baru login (isAuthenticated berubah false -> true),
  // re-registrasi token FCM jika preferensi notifikasi aktif.
  useEffect(() => {
    if (!isAuthenticated) return;

    const reRegister = async () => {
      const enabled = await getNotificationPreference();
      if (enabled) {
        try {
          await reRegisterFcmToken();
          console.log('[FCM] Token berhasil di-re-registrasi setelah login');
        } catch (e) {
          console.log('[FCM] Re-registrasi token setelah login gagal:', e);
        }
      }
    };
    reRegister();
  }, [isAuthenticated]);

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    const success = await enablePushNotifications();
    if (!success) {
      return false;
    }

    await setNotificationPreference(true);
    setIsNotificationEnabled(true);
    return true;
  }, []);

  const disableNotifications = useCallback(async (): Promise<void> => {
    await setNotificationPreference(false);
    setIsNotificationEnabled(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onMessage(getMessaging(), async remoteMessage => {
      console.log('[FCM] Notifikasi diterima saat foreground:', remoteMessage);
      await refreshUnreadCount();
    });
    return unsubscribe;
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        isNotificationEnabled,
        isNotificationLoading,
        refreshUnreadCount,
        enableNotifications,
        disableNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification harus dipakai di dalam <NotificationProvider>',
    );
  }

  return context;
};
