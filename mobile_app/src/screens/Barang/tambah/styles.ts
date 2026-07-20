import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
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

  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoCardList: {
    gap: 6,
  },
  infoCardItem: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  boldText: {
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
});

export default styles;
