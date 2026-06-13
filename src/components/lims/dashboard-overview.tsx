'use client';

import type { LucideIcon } from 'lucide-react';
import { Activity, FileCheck, TestTube2, Users } from 'lucide-react';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { cn, formatCurrency } from '@/lib/utils';

export interface DashboardOverviewKpis {
  totalPatients: number;
  todaySamples: number;
  completedReports: number;
  revenueToday: number;
  todayRegistrations?: number;
}

export interface PendingTestItem {
  id: string;
  label: string;
  status: string;
}

export interface SampleTrendDay {
  label: string;
  count: number;
  heightPct: number;
}

interface KpiCardDef {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  sub?: string;
}

interface DashboardOverviewProps {
  kpis: DashboardOverviewKpis;
  pendingTests: PendingTestItem[];
  sampleTrend: SampleTrendDay[];
  /** Compact sizing for marketing browser mockup */
  compact?: boolean;
  className?: string;
}

export function DashboardOverview({
  kpis,
  pendingTests,
  sampleTrend,
  compact = false,
  className,
}: DashboardOverviewProps) {
  const cards: KpiCardDef[] = [
    {
      label: 'Total Patients',
      value: kpis.totalPatients.toLocaleString('en-IN'),
      icon: Users,
      color: 'bg-primary/10 text-primary',
      sub: kpis.todayRegistrations != null ? `${kpis.todayRegistrations} registered today` : undefined,
    },
    {
      label: "Today's Samples",
      value: String(kpis.todaySamples),
      icon: TestTube2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Reports Generated',
      value: String(kpis.completedReports),
      icon: FileCheck,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Revenue Today',
      value: formatCurrency(kpis.revenueToday),
      icon: Activity,
      color: 'bg-sky-50 text-sky-600',
    },
  ];

  const trendTotal = sampleTrend.reduce((sum, day) => sum + day.count, 0);
  const maxCount = Math.max(...sampleTrend.map((d) => d.count), 1);
  const barAreaHeight = compact ? 64 : 112;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((k) => (
          <div
            key={k.label}
            className={cn('lims-card', compact ? 'p-2 md:p-2.5' : 'p-4')}
          >
            <div className={cn('inline-flex rounded-lg', k.color, compact ? 'p-1' : 'p-2')}>
              <k.icon size={compact ? 12 : 18} />
            </div>
            <p className={cn('mt-2 font-medium text-muted', compact ? 'text-[9px] md:text-[10px]' : 'text-xs')}>
              {k.label}
            </p>
            <p className={cn('font-bold text-slate-900', compact ? 'text-xs md:text-sm' : 'text-xl')}>
              {k.value}
            </p>
            {k.sub && !compact && <p className="mt-0.5 text-xs text-muted">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn('lims-card', compact ? 'p-3' : 'p-5')}>
          <h2 className={cn('font-semibold text-slate-900', compact ? 'text-[10px]' : 'text-sm')}>
            Sample Trends
          </h2>
          <p className={cn('text-muted', compact ? 'mt-0.5 text-[9px]' : 'mt-1 text-xs')}>
            {trendTotal} samples collected — last 7 days
          </p>
          <div className={cn('mt-4', compact && 'mt-2')}>
            <div
              className={cn('flex items-end justify-between gap-1.5 sm:gap-2', compact ? 'h-[88px]' : 'h-[148px]')}
            >
              {sampleTrend.map((day) => {
                const barPx = Math.max(
                  compact ? 8 : 12,
                  Math.round((day.count / maxCount) * barAreaHeight),
                );
                return (
                  <div
                    key={day.label}
                    className="group/bar flex min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <div className="relative flex w-full max-w-[52px] flex-col items-center justify-end">
                      <span
                        className={cn(
                          'pointer-events-none absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-sidebar px-2 py-0.5 font-semibold text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover/bar:opacity-100',
                          compact ? 'text-[8px]' : 'text-xs',
                        )}
                      >
                        {day.count}
                      </span>
                      <div
                        className="w-full cursor-default rounded-t-md bg-gradient-to-t from-primary to-primary/30 transition-all hover:from-primary-500 hover:to-primary/40"
                        style={{ height: `${barPx}px` }}
                        title={`${day.label}: ${day.count} samples`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between gap-1.5 border-t border-muted-border/40 pt-2 sm:gap-2">
              {sampleTrend.map((day) => (
                <span
                  key={`${day.label}-axis`}
                  className={cn(
                    'min-w-0 flex-1 text-center font-medium text-muted',
                    compact ? 'text-[8px]' : 'text-[11px]',
                  )}
                >
                  {day.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={cn('lims-card', compact ? 'p-3' : 'p-5')}>
          <h2 className={cn('font-semibold text-slate-900', compact ? 'text-[10px]' : 'text-sm')}>
            Pending Tests
          </h2>
          <p className={cn('text-muted', compact ? 'mt-0.5 text-[9px]' : 'mt-1 text-xs')}>
            Awaiting results or pathologist approval
          </p>
          <div className={cn('space-y-2', compact ? 'mt-2 max-h-28 overflow-y-auto' : 'mt-4 max-h-52 overflow-y-auto')}>
            {pendingTests.length === 0 ? (
              <p className={cn('text-muted', compact ? 'text-[9px]' : 'text-sm')}>No pending tests right now.</p>
            ) : (
              pendingTests.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg bg-muted-bg',
                    compact ? 'px-2 py-1 text-[9px]' : 'px-3 py-2.5 text-sm',
                  )}
                >
                  <span className="truncate font-medium text-slate-700">{row.label}</span>
                  {compact ? (
                    <span className="shrink-0 rounded-full bg-orange-50 px-1.5 py-0.5 text-[8px] font-medium text-orange-600">
                      {row.status}
                    </span>
                  ) : (
                    <StatusBadge label={row.status} variant={statusVariant(row.status)} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
