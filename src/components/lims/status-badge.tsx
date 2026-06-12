import { cn } from '@/lib/utils';

const VARIANTS: Record<string, string> = {
  success: 'lims-badge-success',
  warning: 'lims-badge-warning',
  error: 'lims-badge-error',
  neutral: 'lims-badge-neutral',
  primary: 'lims-badge-primary',
};

export function StatusBadge({
  label,
  variant = 'neutral',
}: {
  label: string;
  variant?: keyof typeof VARIANTS;
}) {
  return <span className={cn(VARIANTS[variant])}>{label}</span>;
}

export function statusVariant(status: string): keyof typeof VARIANTS {
  const s = status.toLowerCase();
  if (['paid', 'completed', 'approved', 'collected', 'received'].some((x) => s.includes(x))) return 'success';
  if (['pending', 'registered', 'partial', 'assigned'].some((x) => s.includes(x))) return 'warning';
  if (['rejected', 'cancelled', 'critical'].some((x) => s.includes(x))) return 'error';
  if (['processing'].some((x) => s.includes(x))) return 'primary';
  return 'neutral';
}
