import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

const LOGO_HEIGHT: Record<LogoSize, number> = {
  sm: 28,
  md: 34,
  lg: 42,
};

const LOGO_WIDTH: Record<LogoSize, number> = {
  sm: 112,
  md: 136,
  lg: 168,
};

interface LabCoreLogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

export function LabCoreLogo({ size = 'sm', className, priority = false }: LabCoreLogoProps) {
  const height = LOGO_HEIGHT[size];
  const width = LOGO_WIDTH[size];

  return (
    <Image
      src="/images/xangam-logo.png"
      alt="Xangam"
      width={width}
      height={height}
      priority={priority}
      className={cn('h-auto w-auto shrink-0 object-contain object-left', className)}
      style={{ maxHeight: height, width: 'auto', maxWidth: width }}
    />
  );
}
