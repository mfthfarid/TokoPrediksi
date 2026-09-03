import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
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
        pressed && !isDisabled && { opacity: 0.8 },
        isDisabled && styles.disabled,
      ]}
      disabled={isDisabled}
      onPress={onPress}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator size="small" color={Colors.white} />}
        <Text style={styles.text}>
          {loading ? loadingTitle ?? 'Memproses...' : title}
        </Text>
      </View>
    </Pressable>
  );
};

export default PrimaryButton;
