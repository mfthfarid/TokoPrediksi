import api from './api';

// PERINGATAN: field title/message/type di sini masih TEBAKAN,
// belum divalidasi ke response asli backend - sesuaikan kalau meleset.
export interface NotificationApi {
  id: number;
  title: string;
  message: string;
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
