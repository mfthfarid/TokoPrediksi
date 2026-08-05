import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../styles';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '75%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },

  list: {
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  itemPriceLine: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontWeight: '700',
    color: Colors.text,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  stepperButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },

  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    paddingVertical: 30,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: Spacing.sm,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default styles;
