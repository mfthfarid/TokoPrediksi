import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { getNotifications } from '../services/notificationService';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await getNotifications();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      // Gagal ambil unread count bukan hal fatal - biarkan badge
      // tetap nunjukkin angka lama, jangan bikin app error cuma gara-gara ini.
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationCount = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationCount harus dipakai di dalam <NotificationProvider>',
    );
  }
  return context;
};
