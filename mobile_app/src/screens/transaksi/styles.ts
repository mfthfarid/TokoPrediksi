import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  // Tab Transaksi / Riwayat
  // Tab Transaksi / Riwayat
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background, // <-- Diubah menyatu dengan background utama
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8, // Jarak bawah sedikit dirapatkan dengan search bar
    gap: 12, // Jarak antar tombol agak dilebarkan sedikit
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Tombol mati berwarna putih
    borderWidth: 1,
    borderColor: '#e5e5e5', // Garis pinggir tipis agar tombol mati tetap terlihat
  },
  tabButtonActive: {
    backgroundColor: Colors.primary, // Tombol hidup berwarna utama (biru)
    borderColor: Colors.primary, // Border ikut biru agar rapi
  },
  tabRiwayatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary, // Teks tombol mati warna abu-abu
  },
  tabTextActive: {
    color: '#fff', // Teks tombol hidup warna putih
  },

  content: {
    flex: 1,
    padding: 16,
  },

  // Search + scan
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    padding: 0,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filter kategori
  categoryList: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  categoryListContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },

  // Grid produk
  productList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90, // ruang buat cart bar floating
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imagePlaceholder: {
    height: 70,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  stockText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },

  unitButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitButton: {
    flexGrow: 1,
    minWidth: '47%',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  unitButtonName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  unitButtonPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  noUnitText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },

  // Floating cart bar
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  cartBarTotal: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default styles;
