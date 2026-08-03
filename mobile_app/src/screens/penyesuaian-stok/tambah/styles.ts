import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  infoBanner: {
    backgroundColor: '#E6F4EA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#34A853',
    marginBottom: 20,
    marginTop: -8, // Menaikkan sedikit agar dekat dengan SelectField batch
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoBannerTitle: {
    fontWeight: '700',
    color: '#137333',
    marginLeft: 6,
    fontSize: 13,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#137333',
    lineHeight: 18,
  },

  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  resolvingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: Spacing.md,
  },
  infoProductName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff9800',
  },

  fieldWrapper: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },

  quantityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  useAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
  },

  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonActiveDanger: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#fff',
  },

  quantityInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: '#fff',
  },

  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
  },
  dateDisplayText: {
    fontSize: 14,
    color: Colors.text,
  },

  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default styles;
