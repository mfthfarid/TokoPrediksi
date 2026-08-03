import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  historyButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  expiryText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
    marginBottom: 6,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff9800',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default styles;
