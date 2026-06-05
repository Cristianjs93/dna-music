import { Password, type PasswordProps } from 'primereact/password';
import { cn } from '@/utils/cn';

export function DnaPassword({ className, inputClassName, ...props }: PasswordProps) {
  return (
    <Password
      className={cn('dna-control w-full', className)}
      inputClassName={cn('dna-control', inputClassName)}
      {...props}
    />
  );
}
