import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import TextField from '../TextField';
import { Colors } from '../../../styles';

interface PasswordFieldProps extends React.ComponentProps<typeof TextField> {}

const PasswordField = (props: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <TextField
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <EyeOff size={20} color={Colors.textSecondary} />
          ) : (
            <Eye size={20} color={Colors.textSecondary} />
          )}
        </Pressable>
      }
    />
  );
};

export default PasswordField;
