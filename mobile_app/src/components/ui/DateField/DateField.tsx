import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import styles from './styles';
import { Colors } from '../../../styles';

interface DateFieldProps {
  label?: string;
  placeholder?: string;
  value: string; // format DD/MM/YYYY, string kosong = belum dipilih
  onChange: (value: string) => void;
  minimumDate?: Date;
}

const parseDateString = (value: string): Date | null => {
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const DateField = ({
  label,
  placeholder = 'Pilih tanggal',
  value,
  onChange,
  minimumDate,
}: DateFieldProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Di Android, picker otomatis tertutup sendiri setelah pilih/batal
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      onChange(formatDate(selectedDate));
    }
  };

  const currentDate = parseDateString(value) ?? new Date();

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.field}
        onPress={() => setShowPicker(true)}
      >
        <Calendar size={18} color={Colors.textSecondary} />
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
};

export default DateField;
