import { FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

const ICON_SIZE: Record<LogoSize, number> = {
  sm: 22,
  md: 24,
  lg: 28,
};

interface LabCoreLogoProps {
  size?: LogoSize;
  className?: string;
}

export function LabCoreLogo({ size = 'sm', className }: LabCoreLogoProps) {
  return (
    <FlaskConical
      size={ICON_SIZE[size]}
      className={cn('shrink-0 text-primary', className)}
      strokeWidth={2.25}
      aria-hidden
    />
  );
}
