import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import { Image as ImageIconLucide, Pencil } from 'lucide-react-native';
import { Colors } from '../../styles';

interface PhotoPickerProps {
  value: string | null; // local uri hasil compress, siap diupload
  onChange: (uri: string | null) => void;
}

const PhotoPicker = ({ value, onChange }: PhotoPickerProps) => {
  const [processing, setProcessing] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Izin Kamera',
        message: 'Aplikasi butuh akses kamera untuk mengambil foto produk.',
        buttonPositive: 'Izinkan',
        buttonNegative: 'Batal',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const processAsset = async (asset?: Asset) => {
    if (!asset?.uri) return;
    setProcessing(true);
    try {
      // compressionMethod 'auto' -> otomatis cari titik seimbang ukuran & kualitas
      const compressedUri = await ImageCompressor.compress(asset.uri, {
        compressionMethod: 'auto',
        maxWidth: 1280,
      });
      onChange(compressedUri);
    } catch (error) {
      Alert.alert('Gagal', 'Gagal memproses foto, coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  const openCamera = async () => {
    const allowed = await requestCameraPermission();
    if (!allowed) {
      Alert.alert(
        'Izin Ditolak',
        'Aktifkan izin kamera di pengaturan HP untuk pakai fitur ini.',
      );
      return;
    }
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.9,
      saveToPhotos: false,
    });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Gagal', result.errorMessage || 'Gagal membuka kamera.');
      return;
    }
    await processAsset(result.assets?.[0]);
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.9,
    });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Gagal', result.errorMessage || 'Gagal membuka galeri.');
      return;
    }
    await processAsset(result.assets?.[0]);
  };

  const handlePress = () => {
    Alert.alert('Pilih Foto Barang', undefined, [
      { text: 'Kamera', onPress: openCamera },
      { text: 'Galeri', onPress: openGallery },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={processing}
      activeOpacity={0.7}
    >
      {processing ? (
        <ActivityIndicator color={Colors.primary} />
      ) : value ? (
        <>
          <Image
            source={{ uri: value }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.editBadge}>
            <Pencil size={12} color="#fff" />
          </View>
        </>
      ) : (
        <View style={styles.placeholder}>
          <ImageIconLucide size={28} color="#bbb" />
          <Text style={styles.placeholderText}>Tambah Foto</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    gap: 4,
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
  },
});

export default PhotoPicker;
