import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  sub?: string;
  compact?: boolean;
  trend?: { label: string; positive?: boolean };
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconClassName = 'bg-primary/10 text-primary',
  sub,
  compact = false,
  trend,
}: KpiCardProps) {
  return (
    <div className={cn('lims-kpi-card', compact && 'lims-kpi-card-compact')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn('lims-kpi-label', compact && 'text-[10px]')}>{label}</p>
          <p className={cn('lims-kpi-value', compact && 'text-sm')}>{value}</p>
          {sub && !compact && <p className="lims-kpi-sub">{sub}</p>}
          {trend && !compact && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend.positive ? 'text-emerald-600' : 'text-muted',
              )}
            >
              {trend.label}
            </p>
          )}
        </div>
        <div className={cn('lims-kpi-icon', iconClassName, compact && 'h-7 w-7')}>
          <Icon size={compact ? 14 : 18} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
