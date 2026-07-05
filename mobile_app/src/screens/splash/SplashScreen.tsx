import React, { useEffect } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Images } from '../../assets';
import { Colors } from '../../styles';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Toko Prediksi</Text>
      <Text style={styles.subtitle}>Memuat aplikasi...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
