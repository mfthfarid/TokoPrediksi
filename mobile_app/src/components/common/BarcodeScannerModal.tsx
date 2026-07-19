import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Camera } from 'react-native-camera-kit';
import { X } from 'lucide-react-native';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (value: string) => void;
}

const BarcodeScannerModal = ({
  visible,
  onClose,
  onScanned,
}: BarcodeScannerModalProps) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {visible && (
          <Camera
            style={StyleSheet.absoluteFill}
            scanBarcode
            onReadCode={event => {
              const value = event.nativeEvent.codeStringValue;
              if (value) {
                onScanned(value);
                onClose();
              }
            }}
            showFrame
            laserColor="#35b5ff"
            frameColor="#fff"
          />
        )}

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.hint}>Arahkan kamera ke barcode kemasan</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});

export default BarcodeScannerModal;
