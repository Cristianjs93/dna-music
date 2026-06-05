import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({
  label,
  error,
  children,
  className = '',
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm text-dna-muted">
        {label}
      </label>
      {children}
      {error && (
        <small className="mt-1.5 block text-sm text-red-400" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
