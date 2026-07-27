import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 10,
    marginBottom: Spacing.md,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  listContent: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  purchaseDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});

export default styles;
