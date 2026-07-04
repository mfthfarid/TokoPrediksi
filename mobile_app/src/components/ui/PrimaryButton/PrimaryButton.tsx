import React from 'react';
import {
  TouchableOpacity,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';
import { Colors } from '../../../styles';

interface PrimaryButtonProps {
  title: string;
  loadingTitle?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  loadingTitle,
  disabled = false,
}: PrimaryButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 },
        isDisabled && styles.disabled,
      ]}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.text}>
          {loading ? loadingTitle ?? 'Memproses...' : title}
        </Text>
      )}
    </Pressable>
  );
};

export default PrimaryButton;
