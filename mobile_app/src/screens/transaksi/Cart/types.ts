export interface CartItem {
  key: string; // `${productId}-${productUnitId}`
  productId: number;
  productUnitId: number;
  productName: string;
  unitName: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number; // batas stok tersedia buat satuan ini
}
