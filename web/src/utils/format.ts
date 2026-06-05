export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

import { translateApiError } from './errorMessages';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } })
      .response;
    const message = response?.data?.message;
    if (Array.isArray(message)) {
      return message.map(translateApiError).join(', ');
    }
    if (typeof message === 'string') return translateApiError(message);
  }
  if (error instanceof Error) return translateApiError(error.message);
  return fallback;
}
