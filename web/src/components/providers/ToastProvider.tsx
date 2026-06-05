import { useCallback, useRef, type ReactNode } from 'react';
import { Toast } from 'primereact/toast';
import { ToastContext } from '@/context/toast.context';

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastRef = useRef<Toast>(null);

  const showError = useCallback((detail: string) => {
    toastRef.current?.show({
      severity: 'error',
      summary: 'Error',
      detail,
    });
  }, []);

  const showSuccess = useCallback((detail: string, summary = 'Éxito') => {
    toastRef.current?.show({
      severity: 'success',
      summary,
      detail,
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      <Toast ref={toastRef} />
      {children}
    </ToastContext.Provider>
  );
}
