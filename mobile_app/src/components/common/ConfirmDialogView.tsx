import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Colors, Spacing } from '../../styles';

export interface ConfirmDialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  hideCancel?: boolean; // true = mode info, cuma 1 tombol (OK)
}

interface ConfirmDialogViewProps extends ConfirmDialogOptions {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialogView = ({
  visible,
  title,
  message,
  confirmText,
  cancelText = 'Batal',
  danger = false,
  hideCancel = false,
  onConfirm,
  onCancel,
}: ConfirmDialogViewProps) => {
  const finalConfirmText = confirmText ?? (hideCancel ? 'OK' : 'Ya');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={hideCancel ? onConfirm : onCancel}
      >
        <Pressable style={styles.card}>
          {danger && (
            <View style={styles.iconCircle}>
              <AlertTriangle size={22} color="#dc2626" />
            </View>
          )}

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {!hideCancel && (
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                danger && styles.confirmButtonDanger,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{finalConfirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDanger: {
    backgroundColor: '#dc2626',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
export default ConfirmDialogView;
