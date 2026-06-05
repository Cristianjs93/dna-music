import { Calendar, type CalendarProps } from 'primereact/calendar';
import { cn } from '@/utils/cn';

export function DnaCalendar({ className, inputClassName, ...props }: CalendarProps) {
  return (
    <Calendar
      className={cn('dna-control w-full', className)}
      inputClassName={cn('dna-control', inputClassName)}
      {...props}
    />
  );
}
