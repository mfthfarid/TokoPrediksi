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

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    marginBottom: Spacing.md,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryHighlight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  summaryHighlightSafe: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 12,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStatBox: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6,
    borderRadius: 10,
  },
  summaryStatBoxActive: {
    backgroundColor: '#f5f5f5',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: Spacing.sm,
  },
  searchInput: {
    fontSize: 14,
    color: Colors.text,
    padding: 0,
  },

  filterLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  filterLabelBold: {
    fontWeight: '700',
    color: Colors.text,
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