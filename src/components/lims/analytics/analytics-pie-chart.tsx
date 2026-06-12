'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface AnalyticsPieChartProps {
  data: PieSlice[];
  title: string;
  subtitle?: string;
  className?: string;
}

function buildArcs(
  slices: PieSlice[],
  cx: number,
  cy: number,
  r: number,
): { d: string; slice: PieSlice; pct: number }[] {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let angle = 0;
  return slices.map((slice) => {
    const pct = slice.value / total;
    const sweep = pct * 360;
    const start = angle;
    angle += sweep;
    if (slice.value === 0) {
      return { d: '', slice, pct: 0 };
    }
    const startRad = ((start - 90) * Math.PI) / 180;
    const endRad = ((angle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { d, slice, pct };
  });
}

export function AnalyticsPieChart({ data, title, subtitle, className }: AnalyticsPieChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const arcs = buildArcs(data, 80, 80, 72);
  const activeSlice = data.find((d) => d.label === active);

  return (
    <div className={cn('lims-card p-5', className)}>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <svg viewBox="0 0 160 160" className="h-40 w-40">
            {total === 0 ? (
              <circle cx="80" cy="80" r="72" fill="#f1f5f9" />
            ) : (
              arcs.map(({ d, slice, pct }) =>
                d ? (
                  <path
                    key={slice.label}
                    d={d}
                    fill={slice.color}
                    className={cn(
                      'cursor-pointer transition-opacity',
                      active && active !== slice.label && 'opacity-40',
                    )}
                    onMouseEnter={() => setActive(slice.label)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <title>{`${slice.label}: ${slice.value} (${Math.round(pct * 100)}%)`}</title>
                  </path>
                ) : null,
              )
            )}
            <circle cx="80" cy="80" r="42" fill="white" />
            <text x="80" y="76" textAnchor="middle" className="fill-slate-900 text-[13px] font-bold">
              {activeSlice ? activeSlice.value : total}
            </text>
            <text x="80" y="92" textAnchor="middle" className="fill-muted text-[9px]">
              {activeSlice ? activeSlice.label : 'Total'}
            </text>
          </svg>
        </div>

        <ul className="w-full flex-1 space-y-2">
          {data.map((slice) => {
            const pct = total ? Math.round((slice.value / total) * 100) : 0;
            return (
              <li
                key={slice.label}
                className={cn(
                  'flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors',
                  active === slice.label && 'bg-muted-bg',
                )}
                onMouseEnter={() => setActive(slice.label)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate text-slate-700">{slice.label}</span>
                </span>
                <span className="shrink-0 tabular-nums text-slate-900">
                  {slice.value}
                  <span className="ml-1 text-xs text-muted">({pct}%)</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
