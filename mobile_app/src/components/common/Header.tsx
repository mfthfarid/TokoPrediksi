import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HeaderProps } from '../../types/types';
import { Images } from '../../assets';

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onNotificationPress,
}) => {
  const [notificationCount] = useState(3);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 0 }]}>
      <View style={styles.headerContent}>
        {/* Logo */}
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />

        {/* Bagian Judul */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {/* {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>} */}
        </View>

        {/* Tombol Notifikasi dengan Badge */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Icon name="bell" size={24} color="#fff" />

          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#35b5ffff',
    paddingHorizontal: 16,
    // paddingTop sekarang diberikan dinamis lewat insets.top di atas
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titleSection: {
    width: '60%',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
  },

  subtitle: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});

export default Header;
