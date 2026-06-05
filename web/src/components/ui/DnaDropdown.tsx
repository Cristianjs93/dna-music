import { Dropdown, type DropdownProps } from 'primereact/dropdown';
import { cn } from '@/utils/cn';

export function DnaDropdown({ className, ...props }: DropdownProps) {
  return <Dropdown className={cn('dna-control w-full', className)} {...props} />;
}
