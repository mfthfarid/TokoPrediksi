import React from 'react';
import TextField from '../TextField';

interface QuantityFieldProps {
  label?: string;
  placeholder?: string;
  value: string; // digit murni (boleh satu pemisah desimal), mis. "15000" atau "1,5"
  onChangeValue: (raw: string) => void;
  editable?: boolean;
}

// Pemisah ribuan tanpa prefix Rp (berbeda dari CurrencyField).
// Bagian desimal tetap ditampilkan apa adanya setelah pemisah.
const formatThousands = (raw: string): string => {
  if (!raw) return '';
  const sepIndex = raw.search(/[,\.]/);
  const intPart = sepIndex === -1 ? raw : raw.slice(0, sepIndex);
  const decPart = sepIndex === -1 ? '' : raw.slice(sepIndex);
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + decPart;
};

const QuantityField = ({
  label,
  placeholder = '0',
  value,
  onChangeValue,
  editable = true,
}: QuantityFieldProps) => {
  const handleChange = (text: string) => {
    // Buang semua karakter selain digit dan pemisah desimal
    let cleaned = text.replace(/[^\d,.]/g, '');
    // Izinkan hanya satu pemisah desimal (pertahankan yang pertama)
    const firstSep = cleaned.search(/[,\.]/);
    if (firstSep !== -1) {
      cleaned =
        cleaned.slice(0, firstSep + 1) +
        cleaned.slice(firstSep + 1).replace(/[,\.]/g, '');
    }
    onChangeValue(cleaned);
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={formatThousands(value)}
      onChangeText={handleChange}
      keyboardType="numeric"
      editable={editable}
    />
  );
};

export default QuantityField;