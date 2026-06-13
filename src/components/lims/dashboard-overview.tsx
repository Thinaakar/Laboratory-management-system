'use client';

import type { LucideIcon } from 'lucide-react';
import { Activity, FileCheck, TestTube2, Users } from 'lucide-react';
import { KpiCard } from '@/components/lims/kpi-card';
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
  iconClassName: string;
  sub?: string;
}

interface DashboardOverviewProps {
  kpis: DashboardOverviewKpis;
  pendingTests: PendingTestItem[];
  sampleTrend: SampleTrendDay[];
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
      iconClassName: 'bg-primary/10 text-primary',
      sub: kpis.todayRegistrations != null ? `${kpis.todayRegistrations} registered today` : undefined,
    },
    {
      label: "Today's Samples",
      value: String(kpis.todaySamples),
      icon: TestTube2,
      iconClassName: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Reports Generated',
      value: String(kpis.completedReports),
      icon: FileCheck,
      iconClassName: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Revenue Today',
      value: formatCurrency(kpis.revenueToday),
      icon: Activity,
      iconClassName: 'bg-sky-50 text-sky-600',
    },
  ];

  const trendTotal = sampleTrend.reduce((sum, day) => sum + day.count, 0);
  const maxCount = Math.max(...sampleTrend.map((d) => d.count), 1);
  const barAreaHeight = compact ? 64 : 96;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            icon={k.icon}
            iconClassName={k.iconClassName}
            sub={k.sub}
            compact={compact}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn('lims-card', compact ? 'p-3' : 'p-4')}>
          <h2 className={cn('text-sm font-semibold text-slate-900', compact && 'text-xs')}>
            Sample Trends
          </h2>
          <p className={cn('text-muted', compact ? 'mt-0.5 text-[10px]' : 'mt-0.5 text-xs')}>
            {trendTotal} samples collected — last 7 days
          </p>
          <div className={cn('mt-3', compact && 'mt-2')}>
            <div
              className={cn('flex items-end justify-between gap-1.5 sm:gap-2', compact ? 'h-[72px]' : 'h-[120px]')}
            >
              {sampleTrend.map((day) => {
                const barPx = Math.max(
                  compact ? 6 : 10,
                  Math.round((day.count / maxCount) * barAreaHeight),
                );
                return (
                  <div
                    key={day.label}
                    className="group/bar flex min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <div className="relative flex w-full max-w-[48px] flex-col items-center justify-end">
                      <span
                        className={cn(
                          'pointer-events-none absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover/bar:opacity-100',
                          compact && 'text-[8px]',
                        )}
                      >
                        {day.count}
                      </span>
                      <div
                        className="w-full rounded-t bg-primary/80 transition-colors hover:bg-primary"
                        style={{ height: `${barPx}px` }}
                        title={`${day.label}: ${day.count} samples`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between gap-1 border-t border-slate-100 pt-2">
              {sampleTrend.map((day) => (
                <span
                  key={`${day.label}-axis`}
                  className={cn(
                    'min-w-0 flex-1 text-center text-[10px] font-medium text-muted',
                    !compact && 'text-[11px]',
                  )}
                >
                  {day.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={cn('lims-card', compact ? 'p-3' : 'p-4')}>
          <h2 className={cn('text-sm font-semibold text-slate-900', compact && 'text-xs')}>
            Pending Tests
          </h2>
          <p className={cn('text-muted', compact ? 'mt-0.5 text-[10px]' : 'mt-0.5 text-xs')}>
            Awaiting results or pathologist approval
          </p>
          <div className={cn('space-y-1.5', compact ? 'mt-2 max-h-28 overflow-y-auto' : 'mt-3 max-h-48 overflow-y-auto')}>
            {pendingTests.length === 0 ? (
              <p className={cn('text-muted', compact ? 'text-[10px]' : 'text-sm')}>
                No pending tests right now.
              </p>
            ) : (
              pendingTests.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    'flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/80',
                    compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-sm',
                  )}
                >
                  <span className="truncate font-medium text-slate-700">{row.label}</span>
                  {compact ? (
                    <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-medium text-amber-700">
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
