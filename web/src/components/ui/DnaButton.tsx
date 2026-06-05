import { Button, type ButtonProps } from 'primereact/button';
import { cn } from '@/utils/cn';

export type DnaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASS: Record<DnaButtonVariant, string> = {
  primary: 'dna-btn-primary',
  secondary: 'dna-btn-secondary',
  ghost: 'dna-btn-ghost',
  danger: 'dna-btn-danger',
};

export interface DnaButtonProps extends ButtonProps {
  variant?: DnaButtonVariant;
}

export function DnaButton({
  variant = 'secondary',
  className,
  ...props
}: DnaButtonProps) {
  return (
    <Button
      className={cn('dna-btn', VARIANT_CLASS[variant], className)}
      {...props}
    />
  );
}
