import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from 'react';
import ConfirmDialogView, {
  ConfirmDialogOptions,
} from '../components/common/ConfirmDialogView';

interface ConfirmContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({ title: '' });
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = (opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts);
    setVisible(true);
    return new Promise(resolve => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    setVisible(false);
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setVisible(false);
    resolveRef.current?.(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialogView
        visible={visible}
        {...options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextType['confirm'] => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm harus dipakai di dalam <ConfirmProvider>');
  }
  return context.confirm;
};
