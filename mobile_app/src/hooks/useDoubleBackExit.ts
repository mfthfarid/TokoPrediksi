import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

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
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [isFocused, message]);
}
