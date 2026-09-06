import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenLayout from '../../layouts/ScreenLayout';
import {
  NotificationApi,
  getNotifications,
  markNotificationRead,
} from '../../services/notificationService';
import { useNotification } from '../../contexts/NotificationContext';
import { Styles } from './styles';
import { Colors } from '../../styles';

const NotifikasiScreen = () => {
  const [notifications, setNotifications] = useState<NotificationApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUnreadCount } = useNotification();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Gagal mengambil notifikasi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
    refreshUnreadCount();
  };

  const handleNotificationPress = async (item: NotificationApi) => {
    if (item.is_read) return;

    // Update UI langsung agar terasa responsif
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === item.id
          ? { ...notification, is_read: true }
          : notification,
      ),
    );

    try {
      await markNotificationRead(item.id);
      await refreshUnreadCount(); // Update badge di Header
    } catch (error) {
      console.error('Gagal menandai notifikasi:', error);
      // Jika API gagal, kembalikan state sebelumnya
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === item.id
            ? { ...notification, is_read: false }
            : notification,
        ),
      );
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stock_out':
        return 'close-circle-outline';
      case 'stock_low':
        return 'alert-outline';
      case 'prediction_complete':
        return 'chart-line';
      default:
        return 'bell-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'stock_out':
        return '#F44336';
      case 'stock_low':
        return '#F59E0B';
      case 'prediction_complete':
        return Colors.primary;
      default:
        return '#8E8E93';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderNotification = ({ item }: { item: NotificationApi }) => {
    const isUnread = !item.is_read;
    const notificationColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[Styles.notificationItem, isUnread && Styles.notificationUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            Styles.iconContainer,
            isUnread && { backgroundColor: `${notificationColor}15` },
          ]}
        >
          <Icon
            name={getNotificationIcon(item.type)}
            size={22}
            color={isUnread ? notificationColor : '#8E8E93'}
          />
        </View>
        <View style={Styles.notificationContent}>
          {/* Header */}
          <View style={Styles.titleRow}>
            <Text
              style={[
                Styles.notificationTitle,
                isUnread && Styles.notificationTitleUnread,
              ]}
              // numberOfLines={1}
            >
              {item.title}
            </Text>
            {isUnread && (
              <View
                style={[
                  Styles.unreadDot,
                  { backgroundColor: notificationColor },
                ]}
              />
            )}
          </View>

          {/* Body */}
          <Text style={Styles.notificationBody}>{item.body}</Text>

          {/* Tanggal */}
          <Text style={Styles.notificationDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenLayout title="Notifikasi" scrollable={false}>
        <View style={Styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={Styles.loadingText}>Memuat notifikasi...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Notifikasi" scrollable={false} paddingVertical={0}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id.toString()}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          notifications.length === 0
            ? Styles.emptyListContainer
            : Styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={Styles.emptyContainer}>
            <View style={Styles.emptyIconContainer}>
              <Icon name="bell-off-outline" size={42} color="#9CA3AF" />
            </View>

            <Text style={Styles.emptyTitle}>Belum Ada Notifikasi</Text>

            <Text style={Styles.emptyDescription}>
              Notifikasi mengenai aktivitas dan informasi penting akan
              ditampilkan di sini.
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

export default NotifikasiScreen;
