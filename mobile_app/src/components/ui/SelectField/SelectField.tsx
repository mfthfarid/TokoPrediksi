import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import styles from './styles';
import { Colors } from '../../../styles';

export interface SelectOption {
  label: string;
  value: number | string;
}

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  value: number | string | null;
  options: SelectOption[];
  onSelect: (value: number | string) => void;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
}

const SelectField = ({
  label,
  placeholder = 'Pilih',
  value,
  options,
  onSelect,
  leftIcon,
  disabled = false,
}: SelectFieldProps) => {
  const [visible, setVisible] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={0.7}
      >
        {leftIcon}
        <Text
          style={[styles.valueText, !selected && styles.placeholderText]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label ?? placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={item => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value && (
                    <Check size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Belum ada data</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SelectField;
