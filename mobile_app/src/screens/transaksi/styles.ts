import { StyleSheet } from 'react-native';
import { Colors } from '../../styles';

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    position: 'relative',
  },
  cardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardContent: {
    padding: 12,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  unitBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 8,
  },
  unitText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  // Style untuk Overlay Qty
  qtyControlOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  qtyButton: {
    backgroundColor: Colors.primary,
    padding: 4,
    borderRadius: 6,
  },
  qtyTextOverlay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  // Style Empty / Loading State
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  // Style Footer Keranjang
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    // Memberikan shadow agar terlihat terangkat dari list
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartTextContainer: {
    marginLeft: 12,
  },
  cartItemsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cartTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default styles;
