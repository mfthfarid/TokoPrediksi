import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.xl,
  },

  ctaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 24,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  ctaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },

  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: Spacing.md,
  },
  urgencyCardContent: {
    flex: 1,
  },
  urgencyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  urgencyCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },

  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },

  restockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: Spacing.md,
  },
  restockInfo: {},
  restockLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  restockValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  restockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  restockButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  rerunButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.xl,
  },
  rerunButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default styles;
