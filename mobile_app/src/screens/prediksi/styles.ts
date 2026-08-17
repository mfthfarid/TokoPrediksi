import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  stockText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  urgencyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  daysText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});

export default styles;
