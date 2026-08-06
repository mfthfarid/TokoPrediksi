import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },

  totalBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },

  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: Spacing.lg,
  },
  changeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  changeValueInvalid: {
    color: '#dc2626',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButtonWrapper: {
    flex: 1,
  },
});

export default styles;
