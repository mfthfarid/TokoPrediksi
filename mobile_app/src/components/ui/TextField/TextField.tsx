import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import styles from './styles';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const TextField = ({ label, error, leftIcon, rightIcon, ...props }: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, focused && styles.focused]}>
        {leftIcon}
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor="#999"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default TextField;
