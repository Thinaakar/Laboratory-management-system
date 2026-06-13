'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ModuleHubAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  ctaLabel: string;
  variant?: 'primary' | 'secondary';
  onSelect: () => void;
}

export interface ModuleHubColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface ModuleHubProps<T> {
  eyebrow: string;
  title: string;
  description: string;
  actions: ModuleHubAction[];
  activityTitle: string;
  activitySubtitle: string;
  activityEmptyMessage: string;
  items: T[];
  rowKey: (item: T) => string;
  sortDate: (item: T) => string;
  columns: ModuleHubColumn<T>[];
  onViewAll: () => void;
  renderRowActions?: (item: T) => ReactNode;
  recentCount?: number;
}

export function ModuleHub<T>({
  eyebrow,
  title,
  description,
  actions,
  activityTitle,
  activitySubtitle,
  activityEmptyMessage,
  items,
  rowKey,
  sortDate,
  columns,
  onViewAll,
  renderRowActions,
  recentCount = 6,
}: ModuleHubProps<T>) {
  const recentItems = [...items]
    .sort((a, b) => new Date(sortDate(b)).getTime() - new Date(sortDate(a)).getTime())
    .slice(0, recentCount);

  return (
    <div className="patient-hub space-y-8">
      <div className="border-b border-slate-200/80 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        <h1 className="patient-hub-heading mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
      </div>

      <section aria-label="Quick actions">
        <h2 className="patient-hub-heading mb-4 text-sm font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {actions.map((action) => (
            <article key={action.id} className="patient-hub-card flex flex-col p-6 sm:p-8">
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl',
                  action.variant === 'secondary'
                    ? 'bg-[#0F172A]/10 text-[#0F172A]'
                    : 'bg-primary/10 text-primary',
                )}
              >
                <action.icon size={28} strokeWidth={1.75} />
              </div>
              <h3 className="patient-hub-heading mt-5 text-lg font-bold text-slate-900">{action.label}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{action.description}</p>
              <button
                type="button"
                onClick={action.onSelect}
                className={cn(
                  'mt-6 inline-flex w-full items-center justify-center gap-2 sm:w-auto',
                  action.variant === 'secondary' ? 'patient-hub-cta-secondary' : 'patient-hub-cta',
                )}
              >
                {action.ctaLabel}
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Recent activity">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="patient-hub-heading text-sm font-semibold text-slate-900">{activityTitle}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{activitySubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-primary transition-colors hover:text-primary-600"
          >
            View all →
          </button>
        </div>

        <div className="patient-hub-card overflow-hidden">
          {recentItems.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">{activityEmptyMessage}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {columns.map((col) => (
                    <th key={col.key} className="px-5 py-3.5">
                      {col.header}
                    </th>
                  ))}
                  {renderRowActions && <th className="w-28 px-5 py-3.5" />}
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item, i) => (
                  <tr
                    key={rowKey(item)}
                    className={cn(
                      'border-b border-slate-50 transition-colors last:border-0 hover:bg-primary/5',
                      i % 2 === 1 && 'bg-[#F8FAFC]/60',
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-5 py-3.5', col.className)}>
                        {col.render(item)}
                      </td>
                    ))}
                    {renderRowActions && (
                      <td className="px-5 py-3.5">{renderRowActions(item)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
