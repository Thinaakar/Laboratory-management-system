import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

interface LabCoreLogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean; // Kept for interface compatibility
  variant?: 'light' | 'dark';
}

export function LabCoreLogo({ size = 'sm', className, variant = 'dark' }: LabCoreLogoProps) {
  const isLight = variant === 'light';

  const containerClasses = {
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
  };

  const iconClasses = {
    sm: 'h-7 w-7 rounded-lg',
    md: 'h-8.5 w-8.5 rounded-lg',
    lg: 'h-10 w-10 rounded-xl',
  };

  const svgClasses = {
    sm: 'h-4.5 w-4.5',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const subtextClasses = {
    sm: 'text-[8.5px]',
    md: 'text-[9.5px]',
    lg: 'text-[10.5px]',
  };

  return (
    <div className={cn('flex items-center select-none font-display', containerClasses[size], className)}>
      {/* Icon Container with single premium color (#53BDEB) */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center transition-transform hover:scale-105 duration-200',
          iconClasses[size],
          isLight ? 'bg-white/10 text-white' : 'bg-[#53BDEB]/10 text-[#53BDEB]'
        )}
      >
        <svg
          className={svgClasses[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 2v7.31c0 .89-.36 1.74-1 2.38l-4.11 4.11a3 3 0 0 0-.89 2.12v2.08A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2v-2.08a3 3 0 0 0-.89-2.12L15 11.69c-.64-.64-1-1.49-1-2.38V2" />
          <path d="M8.5 2h7" />
          <path d="M7 16h10" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span className={cn('font-bold tracking-tight', textClasses[size], isLight ? 'text-white' : 'text-slate-900')}>
          Lab<span className={isLight ? 'text-white/90' : 'text-slate-900'}>Core</span>
        </span>
        <span className={cn('font-semibold tracking-wider uppercase mt-0.5', subtextClasses[size], isLight ? 'text-[#53BDEB]/90' : 'text-[#53BDEB]')}>
          LIMS
        </span>
      </div>
    </div>
  );
}

