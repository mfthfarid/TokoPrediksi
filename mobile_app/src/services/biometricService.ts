import ReactNativeBiometrics from 'react-native-biometrics';

// allowDeviceCredentials: true -> kalau sensor biometric gagal/tidak ada,
// OS boleh fallback ke PIN/pola/password perangkat (bukan password akun kita)
const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

export const isBiometricSensorAvailable = async (): Promise<{
  available: boolean;
  biometryType: string | null;
}> => {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return { available, biometryType: biometryType ?? null };
  } catch (error) {
    console.error('Gagal cek sensor biometric:', error);
    return { available: false, biometryType: null };
  }
};

export const promptBiometric = async (reason: string): Promise<boolean> => {
  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: reason,
    });
    return success;
  } catch (error) {
    // User membatalkan prompt, atau sensor error -> anggap gagal, bukan crash
    console.error('Biometric prompt error:', error);
    return false;
  }
};
