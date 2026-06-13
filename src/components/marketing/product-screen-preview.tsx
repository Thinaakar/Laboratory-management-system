'use client';

import Image from 'next/image';
import { DashboardOverview } from '@/components/lims/dashboard-overview';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getPatients, getResults, getSamples } from '@/lib/data/store';

const MARKETING_KPIS = {
  totalPatients: 12,
  todaySamples: 9,
  completedReports: 2,
  revenueToday: 2420,
  todayRegistrations: 4,
};

const MARKETING_TREND = [
  { label: 'Sat', count: 5, heightPct: 45 },
  { label: 'Sun', count: 7, heightPct: 63 },
  { label: 'Mon', count: 6, heightPct: 54 },
  { label: 'Tue', count: 10, heightPct: 90 },
  { label: 'Wed', count: 8, heightPct: 72 },
  { label: 'Thu', count: 11, heightPct: 99 },
  { label: 'Fri', count: 9, heightPct: 81 },
];

const MARKETING_PENDING = [
  { id: '1', label: 'CBC — SMP-0001', status: 'Pending Approval' },
  { id: '2', label: 'FBS — SMP-0001', status: 'Pending Approval' },
  { id: '3', label: 'LFT — ORD-0002', status: 'Processing' },
];

export type ProductScreenType = 'dashboard' | 'patients' | 'samples' | 'results' | 'reports';

function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden bg-muted-bg">
      <div className="flex items-center gap-1.5 border-b border-muted-border bg-white px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-orange-300" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
      </div>
      <div className="max-h-[220px] overflow-hidden bg-muted-bg p-2 sm:p-3">{children}</div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <BrowserChrome>
      <DashboardOverview
        compact
        kpis={MARKETING_KPIS}
        pendingTests={MARKETING_PENDING}
        sampleTrend={MARKETING_TREND}
      />
    </BrowserChrome>
  );
}

function PatientsPreview() {
  const rows = getPatients().slice(0, 4);
  return (
    <BrowserChrome>
      <table className="w-full text-left text-[10px]">
        <thead className="border-b border-muted-border text-muted">
          <tr>
            <th className="pb-1.5 pr-2">ID</th>
            <th className="pb-1.5 pr-2">Name</th>
            <th className="pb-1.5 pr-2">Phone</th>
            <th className="pb-1.5">Status</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-muted-border/50">
              <td className="py-1.5 pr-2 font-mono">{p.id.replace('PAT-0000', 'PAT-')}</td>
              <td className="py-1.5 pr-2 font-medium">{p.name.split(' ')[0]} {p.name.split(' ')[1]?.[0]}.</td>
              <td className="py-1.5 pr-2 text-muted">{p.phone.slice(0, 10)}…</td>
              <td className="py-1.5">
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </BrowserChrome>
  );
}

function SamplesPreview() {
  const sample = getSamples()[0];
  if (!sample) return null;
  const statusIdx: Record<string, number> = {
    Registered: 0,
    Collected: 1,
    Received: 2,
    Processing: 3,
    Completed: 4,
  };
  const activeIdx = statusIdx[sample.status] ?? 0;
  return (
    <BrowserChrome>
      <div className="flex gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-muted-border bg-white">
          <div className="h-6 w-5 bg-[repeating-linear-gradient(90deg,#0f172a_0,#0f172a_1px,transparent_1px,transparent_3px)] opacity-40" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-900">{sample.id.replace('SMP-2026-', 'SMP-')}</p>
          <p className="text-[10px] text-muted">
            {sample.barcode} · {sample.sampleType}
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {['Registered', 'Collected', 'Processing', 'Completed'].map((s, i) => {
          const lit = activeIdx >= (s === 'Registered' ? 0 : s === 'Collected' ? 1 : s === 'Processing' ? 3 : 4);
          return (
            <div key={s} className="flex items-center gap-2 text-[10px]">
              <div
                className={`h-2 w-2 rounded-full ${lit ? 'bg-primary' : 'border border-muted-border bg-white'}`}
              />
              <span className={lit ? 'font-medium text-slate-900' : 'text-muted'}>{s}</span>
            </div>
          );
        })}
      </div>
    </BrowserChrome>
  );
}

function ResultsPreview() {
  const results = getResults().slice(0, 3);
  return (
    <BrowserChrome>
      <p className="mb-2 text-[11px] font-semibold text-slate-900">Result Entry — CBC</p>
      <div className="space-y-1.5">
        {results.map((r) => (
          <div
            key={r.id}
            className={`flex items-center justify-between rounded border px-2 py-1.5 text-[10px] ${
              r.isCritical ? 'border-red-200 bg-red-50' : 'border-muted-border bg-white'
            }`}
          >
            <span className="font-medium">{r.testName.split(' ')[0]}</span>
            <span className="font-semibold">{r.value}</span>
            <span className="text-muted">{r.referenceRange ?? '—'}</span>
            {r.isCritical ? <span className="text-red-600">⚠</span> : null}
          </div>
        ))}
      </div>
    </BrowserChrome>
  );
}

function ReportsPreview() {
  return (
    <BrowserChrome>
      <div className="rounded border border-muted-border bg-white p-2.5">
        <div className="flex items-center justify-between border-b border-muted-border pb-1.5">
          <p className="text-[11px] font-bold text-slate-900">LabCore Diagnostic</p>
          <div className="h-7 w-7 rounded bg-muted-bg" />
        </div>
        <p className="mt-1.5 text-[10px] text-muted">Patient: Rahul Verma · PAT-000001</p>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[10px]">
            <span>CBC</span>
            <span className="font-medium">7.2 cells/µL</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>FBS</span>
            <span className="font-medium text-red-600">118 mg/dL</span>
          </div>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-[9px] text-muted">Dr. Meera Iyer · Digitally Signed</p>
          <div className="h-8 w-8 rounded border border-dashed border-muted-border bg-muted-bg" />
        </div>
      </div>
    </BrowserChrome>
  );
}

const PREVIEWS: Record<ProductScreenType, () => React.ReactNode> = {
  dashboard: DashboardPreview,
  patients: PatientsPreview,
  samples: SamplesPreview,
  results: ResultsPreview,
  reports: ReportsPreview,
};

export function ProductScreenPreview({ type }: { type: ProductScreenType }) {
  const Preview = PREVIEWS[type];
  return <Preview />;
}

/** Full-bleed LabCore brand image for marketing hero */
export function MarketingBrandHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-muted-border shadow-card-md">
      <div className="relative aspect-[4/3] w-full lg:aspect-[5/4]">
        <Image
          src="/images/labcore-brand-hero.png"
          alt="LabCore LIMS — Laboratory Information Management for diagnostic centers"
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  );
}
