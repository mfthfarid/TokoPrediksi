import { StyleSheet } from 'react-native';
import { Colors } from '../../styles';

export const Styles = StyleSheet.create({
  listContent: {
    // marginTop: 12,
    marginVertical: 12,
    paddingBottom: 24,
    gap: 10,
  },

  notificationItem: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  notificationUnread: {
    backgroundColor: '#F3F9FF',
    borderColor: '#D8EDFF',
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconContainerUnread: {
    backgroundColor: '#E3F2FD',
  },

  notificationContent: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },

  notificationTitleUnread: {
    fontWeight: '700',
    color: '#1F2937',
  },

  notificationBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  notificationDate: {
    marginTop: 8,
    fontSize: 11,
    color: '#9CA3AF',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },

  emptyListContainer: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
