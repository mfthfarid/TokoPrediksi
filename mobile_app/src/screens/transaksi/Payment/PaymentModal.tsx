import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '../../../styles';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import styles from './styles';

interface PaymentModalProps {
  visible: boolean;
  total: number;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cashReceived: string;
  onChangeCashReceived: (value: string) => void;
}

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

const PaymentModal = ({
  visible,
  total,
  submitting,
  onClose,
  onConfirm,
  cashReceived,
  onChangeCashReceived,
}: PaymentModalProps) => {
  const cashNumber = parseFloat(cashReceived.replace(/\D/g, '')) || 0;
  const change = cashNumber - total;
  const isValid = cashNumber >= total;

  const handleChangeText = (text: string) => {
    onChangeCashReceived(text.replace(/\D/g, ''));
  };

  const handleQuickAmount = (amount: number) => {
    onChangeCashReceived(String(amount));
  };

  const handlePas = () => {
    onChangeCashReceived(String(total));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Pembayaran</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Tagihan</Text>
            <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
          </View>

          <Text style={styles.fieldLabel}>Uang Diterima</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={
              cashReceived ? Number(cashReceived).toLocaleString('id-ID') : ''
            }
            onChangeText={handleChangeText}
          />

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map(amount => (
              <TouchableOpacity
                key={amount}
                style={styles.quickButton}
                onPress={() => handleQuickAmount(amount)}
              >
                <Text style={styles.quickButtonText}>{amount / 1000}rb</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.quickButton} onPress={handlePas}>
              <Text style={styles.quickButtonText}>Pas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.changeRow}>
            <Text style={styles.changeLabel}>Kembalian</Text>
            <Text
              style={[
                styles.changeValue,
                !isValid && styles.changeValueInvalid,
              ]}
            >
              {isValid ? formatRupiah(change) : '-'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <View style={styles.confirmButtonWrapper}>
              <PrimaryButton
                title="Selesaikan"
                loadingTitle="Memproses..."
                loading={submitting}
                disabled={!isValid}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PaymentModal;
