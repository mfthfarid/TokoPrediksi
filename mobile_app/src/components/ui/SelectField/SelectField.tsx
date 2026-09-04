import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ChevronDown, Check, Search, X } from 'lucide-react-native';
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
  searchable?: boolean;
  searchPlaceholder?: string;
}

const SelectField = ({
  label,
  placeholder = 'Pilih',
  value,
  options,
  onSelect,
  leftIcon,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Cari...',
}: SelectFieldProps) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selected = options.find(o => o.value === value);

  const filteredOptions = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!searchable || !keyword) {
      return options;
    }

    return options.filter(option =>
      option.label.toLowerCase().includes(keyword),
    );
  }, [searchQuery, searchable, options]);

  const handleClose = () => {
    setVisible(false);
    setSearchQuery('');
  };

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
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <KeyboardAvoidingView behavior="padding" style={styles.keyboard}>
            <Pressable style={styles.sheet}>
              <Text style={styles.sheetTitle}>{label ?? placeholder}</Text>
              {searchable && (
                <View style={styles.searchBox}>
                  <Search size={16} color={Colors.textSecondary} />

                  <TextInput
                    style={styles.searchInput}
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />

                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      hitSlop={{
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                      }}
                    >
                      <X size={17} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <FlatList
                data={filteredOptions}
                keyExtractor={item => String(item.value)}
                style={styles.optionContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      handleClose();

                      requestAnimationFrame(() => {
                        onSelect(item.value);
                      });
                    }}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>

                    {item.value === value && (
                      <Check size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Tidak ditemukan' : 'Belum ada data'}
                  </Text>
                }
              />
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SelectField;
