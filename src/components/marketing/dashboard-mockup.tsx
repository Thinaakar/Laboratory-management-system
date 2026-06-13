'use client';

import { DashboardOverview } from '@/components/lims/dashboard-overview';

const MARKETING_KPIS = {
  totalPatients: 12480,
  todaySamples: 186,
  completedReports: 142,
  revenueToday: 84200,
};

const MARKETING_PENDING = [
  { id: '1', label: 'CBC — SMP-001', status: 'Pending' },
  { id: '2', label: 'LFT — SMP-002', status: 'Pending' },
  { id: '3', label: 'TSH — SMP-003', status: 'Pending' },
];

const MARKETING_TREND = [
  { label: 'Mon', count: 5, heightPct: 42 },
  { label: 'Tue', count: 7, heightPct: 58 },
  { label: 'Wed', count: 6, heightPct: 50 },
  { label: 'Thu', count: 10, heightPct: 82 },
  { label: 'Fri', count: 8, heightPct: 66 },
  { label: 'Sat', count: 11, heightPct: 90 },
  { label: 'Sun', count: 9, heightPct: 74 },
];

export function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -left-4 top-8 z-10 hidden w-36 rounded-lg border border-muted-border bg-white p-3 shadow-card-md lg:block">
        <p className="text-[10px] font-medium text-muted">Total Patients</p>
        <p className="text-lg font-bold text-slate-900">12,480</p>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted-bg">
          <div className="h-full w-3/4 rounded-full bg-primary" />
        </div>
      </div>
      <div className="absolute -right-2 top-24 z-10 hidden w-32 rounded-lg border border-muted-border bg-white p-3 shadow-card-md lg:block">
        <p className="text-[10px] font-medium text-muted">Revenue Today</p>
        <p className="text-base font-bold text-slate-900">₹84,200</p>
      </div>
      <div className="absolute -bottom-2 -left-2 z-10 hidden w-32 rounded-lg border border-muted-border bg-white p-3 shadow-card-md md:block">
        <p className="text-[10px] font-medium text-muted">Reports</p>
        <p className="text-base font-bold text-emerald-600">142 ✓</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-muted-border bg-white shadow-card-md">
        <div className="flex items-center gap-2 border-b border-muted-border bg-muted-bg px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-orange-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto flex-1 rounded-md bg-white px-3 py-1 text-center text-[10px] text-muted">
            app.labcore.io/dashboard
          </div>
        </div>

        <div className="flex min-h-[320px]">
          <div className="hidden w-14 shrink-0 bg-sidebar sm:block md:w-16">
            <div className="flex h-10 items-center justify-center border-b border-white/10">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[9px] font-bold text-white">
                LC
              </div>
            </div>
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-6 rounded ${i === 1 ? 'bg-primary/30' : 'bg-white/5'}`} />
              ))}
            </div>
          </div>

          <div className="flex-1 bg-muted-bg p-3 md:p-4">
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-900">Dashboard</p>
              <p className="text-[10px] text-muted">Lab operations overview</p>
            </div>

            <DashboardOverview
              compact
              kpis={MARKETING_KPIS}
              pendingTests={MARKETING_PENDING}
              sampleTrend={MARKETING_TREND}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
