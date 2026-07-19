import React from 'react';
import { Text } from 'react-native';
import TextField from '../TextField';
import { Colors } from '../../../styles';

interface CurrencyFieldProps {
  label?: string;
  placeholder?: string;
  value: string; // disimpan sebagai digit murni, mis. "15000"
  onChangeValue: (rawDigits: string) => void;
  editable?: boolean;
}

const formatRupiah = (digits: string): string => {
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const CurrencyField = ({
  label,
  placeholder = '0',
  value,
  onChangeValue,
  editable = true,
}: CurrencyFieldProps) => {
  const handleChange = (text: string) => {
    // Buang semua karakter selain digit (termasuk titik hasil format sebelumnya)
    const digitsOnly = text.replace(/\D/g, '');
    onChangeValue(digitsOnly);
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={formatRupiah(value)}
      onChangeText={handleChange}
      keyboardType="numeric"
      editable={editable}
      leftIcon={
        <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>
          Rp
        </Text>
      }
    />
  );
};

export default CurrencyField;
