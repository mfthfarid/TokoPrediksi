import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import ToastView, { ToastType } from '../components/common/ToastView';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 5000;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const idRef = useRef(0);

  const show = useCallback((message: string, type: ToastType) => {
    idRef.current += 1;
    setToast({ id: idRef.current, message, type });
  }, []);

  const hide = useCallback(() => setToast(null), []);

  const value: ToastContextType = {
    success: message => show(message, 'success'),
    error: message => show(message, 'error'),
    info: message => show(message, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <ToastView
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={DEFAULT_DURATION}
          onHide={hide}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  }
  return context;
};
