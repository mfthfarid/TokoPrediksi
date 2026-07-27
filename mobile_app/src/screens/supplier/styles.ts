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

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  rowSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveButton: {
    flex: 1,
  },
});

export default styles;
