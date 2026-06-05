import { createContext, useContext } from 'react';

export interface ToastContextValue {
  showError: (detail: string) => void;
  showSuccess: (detail: string, summary?: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext debe usarse dentro de ToastProvider');
  }
  return context;
}
