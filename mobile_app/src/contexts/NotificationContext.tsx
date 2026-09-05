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
import { enablePushNotifications } from '../services/fcmService';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);

  // Bootstrap preference saat aplikasi dibuka
  useEffect(() => {
    const bootstrap = async () => {
      const enabled = await getNotificationPreference();
      setIsNotificationEnabled(enabled);
      setIsNotificationLoading(false);
    };
    bootstrap();
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await getNotifications();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      // Gagal ambil unread count bukan hal fatal
      console.error('[Notification] Gagal refresh unread count:', error);
    }
  }, []);

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
