import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { Minus, Plus, Trash2, X, ShoppingCart } from 'lucide-react-native';
import { Colors } from '../../../styles';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { CartItem } from './types';
import styles from './styles';

interface CartModalProps {
  visible: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
}

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const CartModal = ({
  visible,
  items,
  total,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: CartModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <ShoppingCart size={18} color={Colors.text} />
              <Text style={styles.headerTitle}>
                Keranjang ({items.length} item)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={item => item.key}
            style={styles.list}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.productName}
                    {item.unitName ? ` (${item.unitName})` : ''}
                  </Text>
                  <Text style={styles.itemPriceLine}>
                    {formatRupiah(item.unitPrice)} x {item.quantity} ={' '}
                    <Text style={styles.itemSubtotal}>
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </Text>
                  </Text>
                </View>

                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() => onDecrement(item.key)}
                  >
                    <Minus size={14} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() => onIncrement(item.key)}
                  >
                    <Plus size={14} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => onRemove(item.key)}>
                  <Trash2 size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Keranjang masih kosong</Text>
            }
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
          </View>

          <PrimaryButton
            title="Bayar"
            onPress={onCheckout}
            disabled={items.length === 0}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CartModal;
