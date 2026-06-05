import { useCallback, useRef } from 'react';
import type { Toast } from 'primereact/toast';

export function useToast() {
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

  return { toastRef, showError, showSuccess };
}
