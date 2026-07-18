import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

/**
 * Pasang di screen yang jadi "pintu keluar" app (biasanya tab Dashboard).
 * Tekan back sekali -> muncul toast peringatan.
 * Tekan back lagi dalam 2 detik -> aplikasi keluar (BackHandler.exitApp).
 *
 * useIsFocused memastikan hook ini HANYA aktif saat screen ini yang sedang
 * dilihat user -> tab/screen lain tetap pakai perilaku back normal (pop stack).
 */
export function useDoubleBackExit(
  message: string = 'Tekan sekali lagi untuk keluar',
) {
  const isFocused = useIsFocused();
  const lastBackPress = useRef(0);

  useEffect(() => {
    if (!isFocused) return;

    const onBackPress = () => {
      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPress.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
      return true; // true = kita yang handle, jangan biarkan default Android
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [isFocused, message]);
}
