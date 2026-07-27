import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  basicInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: Spacing.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addRowButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: Spacing.md,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  rowInline: {
    flexDirection: 'row',
    gap: 10,
  },
  rowInlineItem: {
    flex: 1,
  },

  itemSubtotal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'right',
    marginTop: 4,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 12,
  },
  footerLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footerTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  footerButton: {
    minWidth: 140,
  },
});

export default styles;
