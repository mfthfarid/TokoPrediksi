import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  greetingContainer: {
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statValueSuffix: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4caf50',
  },
  statValueWarning: {
    color: '#ff9800',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cardLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  listRowText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    marginRight: 8,
  },
  listRowWarning: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  listRowBold: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    paddingVertical: 8,
  },

  stockoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: Spacing.md,
  },
  stockoutBannerText: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stockoutBannerArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  chevronFlipped: {
    transform: [{ rotate: '180deg' }],
  },

  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    alignItems: 'center',
    width: 72,
  },
  menuIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  menuItemText: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
});

export default styles;
