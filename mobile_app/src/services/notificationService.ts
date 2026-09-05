import api from './api';

export interface NotificationApi {
  id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListApi {
  unread_count: number;
  notifications: NotificationApi[];
}

export const getNotifications = () =>
  api.get<NotificationListApi>('/api/notifications');

export const markNotificationRead = (id: number) =>
  api.put(`/api/notifications/${id}/read`);

export const registerFcmToken = (token: string) =>
  api.post('/api/notifications/fcm-token', { token });
