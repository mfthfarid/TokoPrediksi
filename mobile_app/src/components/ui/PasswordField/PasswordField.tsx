import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import TextField from '../TextField';
import { Colors } from '../../../styles'; // Sesuaikan kembali path ini jika salah

interface PasswordFieldProps extends React.ComponentProps<typeof TextField> {}

const PasswordField = ({ editable = true, ...props }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      {...props}
      editable={editable}
      secureTextEntry={!showPassword}
      // Ikon mata HANYA dirender jika status editable adalah true
      rightIcon={
        editable ? (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color={Colors.textSecondary} />
            ) : (
              <Eye size={20} color={Colors.textSecondary} />
            )}
          </Pressable>
        ) : undefined
      }
    />
  );
};

export default PasswordField;
