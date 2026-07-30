import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  headerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  historyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  historyButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  editToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  cancelToggleButton: {
    backgroundColor: '#dc2626',
  },
  editToggleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  basicInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: Spacing.md,
  },

  photoView: {
    width: 250,
    height: 200,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },

  viewField: {
    marginBottom: Spacing.md,
  },
  viewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  viewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
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

  // Kartu satuan mode edit
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: Spacing.md,
  },
  unitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  baseUnitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  baseUnitLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  activeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: Spacing.sm,
  },
  activeToggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },

  costInfoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: Spacing.sm,
    marginTop: -6,
  },

  rowInline: {
    flexDirection: 'row',
    gap: 10,
  },
  rowInlineItem: {
    flex: 1,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barcodeInput: {
    flex: 1,
  },
  generateButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },

  // Kartu satuan mode view (read-only)
  unitViewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: Spacing.sm,
  },
  unitViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  unitViewName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  unitViewBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  baseBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  baseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  inactiveBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
  },
  unitViewDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  unitViewTapHint: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 6,
    fontWeight: '600',
  },
});

export default styles;
