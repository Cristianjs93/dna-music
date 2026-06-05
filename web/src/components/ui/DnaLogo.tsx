import { cn } from '@/utils/cn';

interface DnaLogoProps {
  className?: string;
  height?: string;
}

export function DnaLogo({ className, height = 'h-[3.75rem]' }: DnaLogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md bg-white/5 px-3 py-2 backdrop-blur-sm',
        className,
      )}
    >
      <img
        src="/logo-horizontal-negro.avif"
        alt="DNA Music"
        className={cn('dna-logo w-auto', height)}
      />
    </div>
  );
}
