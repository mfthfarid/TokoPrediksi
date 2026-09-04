import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import styles from './styles';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const TextField = ({
  label,
  error,
  leftIcon,
  rightIcon,
  editable = true,
  multiline = false,
  ...props
}: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          focused && styles.focused,
          !editable && {
            backgroundColor: '#F5F5F5',
            borderColor: '#E0E0E0',
          },
        ]}
      >
        {leftIcon && (
          <View
            style={[
              styles.iconContainer,
              multiline && styles.multilineIconContainer,
            ]}
          >
            {leftIcon}
          </View>
        )}
        <TextInput
          {...props}
          editable={editable}
          multiline={multiline}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            !editable && { color: '#9E9E9E' },
          ]}
          placeholderTextColor={editable ? '#999' : '#BDBDBD'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default TextField;
