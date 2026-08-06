import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../styles'; // Pastikan path ini sesuai dengan project Anda

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Background abu-abu sangat terang agar konten menonjol
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // TAB BAR (Transaksi / Riwayat)
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF', // Abu-abu
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabRiwayatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // MAIN CONTENT AREA
  content: {
    flex: 1,
  },

  // SEARCH BAR & SCAN BUTTON
  searchRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1F2937',
    height: '100%',
  },
  scanButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // CATEGORY FILTER
  categoryList: {
    maxHeight: 44, // Mencegah flatlist kategori melebar vertikal
    marginBottom: 12,
  },
  categoryListContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // PRODUCT GRID
  productList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100, // Ruang lega di bawah agar item terakhir tidak tertutup Cart Bar
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    width: '48%', // Untuk 2 kolom di Flatlist
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // Shadow ringan
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imagePlaceholder: {
    height: 90,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D1D5DB',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },

  // UNIT BUTTONS (DALAM KARTU)
  unitButtonsRow: {
    flexDirection: 'column', // Disusun ke bawah (vertikal) di dalam card
    gap: 6,
  },
  noUnitText: {
    fontSize: 11,
    color: '#EF4444',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 4,
  },
  unitButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  unitButtonName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    flex: 1,
    marginRight: 4,
  },
  unitButtonPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },

  // EMPTY STATE (Barang Kosong)
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
  },

  // FLOATING CART BAR (Bawah)
  cartBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    // Efek melayang
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Jarak icon dengan teks
  },
  cartBarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cartBarTotal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;
