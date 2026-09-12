import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../styles';

export const Styles = StyleSheet.create({
  listContent: {
    // paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 10,
  },
  headerContent: {
    gap: 12,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  customRangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  customRangeField: {
    flex: 1,
  },
  applyButton: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  periodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 2,
  },
  periodText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryRevenue: {
    marginTop: 5,
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 3,
  },
  comparisonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 2,
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallSummaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 14,
    minHeight: 145,
  },
  cardIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallCardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  profitValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  marginValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  marginDescription: {
    marginTop: 5,
    fontSize: 11,
    color: '#9CA3AF',
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  activityItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  activityLabel: {
    marginTop: 2,
    fontSize: 11,
    color: '#9CA3AF',
  },
  activityDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
  },

  sectionHeader: {
    marginTop: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#9CA3AF',
  },

  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 14,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  productTitleContainer: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  productQuantity: {
    marginTop: 3,
    fontSize: 11,
    color: '#9CA3AF',
  },
  marginBadge: {
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  marginBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  productDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  productStats: {
    flexDirection: 'row',
  },
  productStat: {
    flex: 1,
  },
  productStatLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 3,
  },
  productStatValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  productProfit: {
    color: '#16A34A',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
