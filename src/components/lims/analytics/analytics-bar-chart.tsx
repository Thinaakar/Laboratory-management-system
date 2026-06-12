'use client';

import { cn, formatCurrency } from '@/lib/utils';

export interface BarChartItem {
  label: string;
  value: number;
}

interface AnalyticsBarChartProps {
  data: BarChartItem[];
  title: string;
  subtitle?: string;
  /** Format bar values in tooltip / hover */
  valueFormat?: 'number' | 'currency';
  className?: string;
}

export function AnalyticsBarChart({
  data,
  title,
  subtitle,
  valueFormat = 'number',
  className,
}: AnalyticsBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const barAreaHeight = 140;

  const formatValue = (v: number) =>
    valueFormat === 'currency' ? formatCurrency(v) : v.toLocaleString('en-IN');

  return (
    <div className={cn('lims-card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Total</p>
          <p className="text-lg font-bold text-slate-900">{formatValue(total)}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex h-[148px] items-end justify-between gap-1.5 sm:gap-2">
          {data.map((item) => {
            const barPx = Math.max(12, Math.round((item.value / max) * barAreaHeight));
            return (
              <div
                key={item.label}
                className="group/bar flex min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div className="relative flex w-full max-w-[56px] flex-col items-center justify-end">
                  <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-sidebar px-2 py-0.5 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover/bar:opacity-100">
                    {formatValue(item.value)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/25 transition-all hover:from-primary-500 hover:to-primary/40"
                    style={{ height: `${barPx}px` }}
                    title={`${item.label}: ${formatValue(item.value)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between gap-1.5 border-t border-muted-border/40 pt-2 sm:gap-2">
          {data.map((item) => (
            <span
              key={`${item.label}-axis`}
              className="min-w-0 flex-1 truncate text-center text-[11px] font-medium text-muted"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
