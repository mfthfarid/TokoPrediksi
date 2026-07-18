import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import api, { setUnauthorizedHandler } from '../services/api';
import {
  getToken,
  setToken as saveToken,
  removeToken,
} from '../services/tokenStorage';
import {
  getBiometricPreference,
  setBiometricPreference,
} from '../services/biometricPreference';
import {
  promptBiometric,
  isBiometricSensorAvailable,
} from '../services/biometricService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // true saat bootstrap pertama (dipakai splash screen)
  isLocked: boolean; // true kalau biometric aktif & app baru dibuka/kembali dari background
  isBiometricEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  unlockWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabledState] = useState(false);
  const appState = useRef(AppState.currentState);

  // Bootstrap: cek token & preferensi biometric saat app pertama kali dibuka
  useEffect(() => {
    const bootstrap = async () => {
      const token = await getToken();
      const biometricEnabled = await getBiometricPreference();

      setIsAuthenticated(!!token);
      setIsBiometricEnabledState(biometricEnabled);
      // Kalau ada token DAN biometric aktif -> app harus dibuka pakai fingerprint dulu
      setIsLocked(!!token && biometricEnabled);
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  // Kunci ulang app setiap kali kembali dari background (kalau biometric aktif)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        const cameToForeground =
          appState.current.match(/inactive|background/) &&
          nextState === 'active';

        if (cameToForeground && isAuthenticated && isBiometricEnabled) {
          setIsLocked(true);
        }
        appState.current = nextState;
      },
    );
    return () => subscription.remove();
  }, [isAuthenticated, isBiometricEnabled]);

  // Kalau ada request manapun kena 401 (token expired/invalid), otomatis logout
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIsAuthenticated(false);
      setIsLocked(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;
    await saveToken(token);
    setIsAuthenticated(true);
    setIsLocked(false);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setIsAuthenticated(false);
    setIsLocked(false);
  }, []);

  // Dipanggil dari halaman Pengaturan saat user menyalakan toggle "Login Fingerprint"
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    const { available } = await isBiometricSensorAvailable();
    if (!available) {
      return false; // panggil ini di UI untuk tampilkan pesan "sensor tidak tersedia"
    }
    const success = await promptBiometric(
      'Konfirmasi sidik jari untuk mengaktifkan login fingerprint',
    );
    if (success) {
      await setBiometricPreference(true);
      setIsBiometricEnabledState(true);
    }
    return success;
  }, []);

  const disableBiometric = useCallback(async () => {
    await setBiometricPreference(false);
    setIsBiometricEnabledState(false);
  }, []);

  // Dipanggil dari lock screen saat app dibuka / kembali dari background
  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    const success = await promptBiometric(
      'Buka TokoPrediksi dengan sidik jari',
    );
    if (success) {
      setIsLocked(false);
    }
    return success;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isLocked,
        isBiometricEnabled,
        login,
        logout,
        enableBiometric,
        disableBiometric,
        unlockWithBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  }
  return context;
};
