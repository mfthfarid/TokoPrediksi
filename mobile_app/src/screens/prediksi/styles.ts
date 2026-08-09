import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../styles'; // Pastikan path ini benar mengarah ke theme Anda

// Palet warna khusus untuk aura "Cerdas/AI" di halaman Prediksi
const AI_COLOR = '#6366f1'; // Biru keunguan (Indigo)
const AI_BG = '#eef2ff';
const DANGER_COLOR = '#ef4444'; // Merah
const DANGER_BG = '#fef2f2';
const WARNING_COLOR = '#f59e0b'; // Oranye/Kuning
const WARNING_BG = '#fffbeb';

export default StyleSheet.create({
  // --- Hero Section ---
  heroContainer: {
    backgroundColor: AI_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroUpdateText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '500',
  },
  predictButton: {
    backgroundColor: AI_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: AI_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  predictButtonDisabled: {
    backgroundColor: '#a5b4fc',
    shadowOpacity: 0,
    elevation: 0,
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // --- Segmented Tabs ---
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: Colors.text,
  },

  // --- List & Cards ---
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  stockText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  stockNumber: {
    fontWeight: '700',
    color: Colors.text,
  },

  // --- Badges ---
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeDanger: {
    backgroundColor: DANGER_BG,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  badgeWarning: {
    backgroundColor: WARNING_BG,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  textDanger: {
    color: DANGER_COLOR,
  },
  textWarning: {
    color: WARNING_COLOR,
  },

  // --- Card Footer (Divider, Stats, Action) ---
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  restokButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  restokIcon: {
    marginRight: 6,
  },
  restokButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // --- Empty State ---
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
});
