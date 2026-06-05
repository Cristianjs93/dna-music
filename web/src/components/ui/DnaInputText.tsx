import { InputText, type InputTextProps } from 'primereact/inputtext';
import { cn } from '@/utils/cn';

export function DnaInputText({ className, ...props }: InputTextProps) {
  return <InputText className={cn('dna-control', className)} {...props} />;
}
