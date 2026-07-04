import React from 'react';
import { Modal, View, Text, ActivityIndicator } from 'react-native';
import styles from './styles';
import ProgressBar from './ProgressBar';
import { Colors } from '../../../styles';

interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
  message?: string;
  progress?: number;
}

const LoadingOverlay = ({
  visible,
  title = 'Sedang Memproses...',
  message = 'Mohon tunggu sebentar.',
  progress,
}: LoadingOverlayProps) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.loadingContainer}>
            {progress === undefined ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <>
                <ProgressBar progress={progress} />

                <Text style={styles.progressText}>{progress}%</Text>
              </>
            )}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;
