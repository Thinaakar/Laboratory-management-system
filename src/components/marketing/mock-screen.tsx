'use client';

import type { ReactNode } from 'react';

type ScreenType = 'dashboard' | 'patients' | 'samples' | 'results' | 'reports';

export function MockScreen({ type }: { type: ScreenType }) {
  const screens: Record<ScreenType, ReactNode> = {
    dashboard: (
      <div className="space-y-2 p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {['12,480', '186', '142', '₹84K'].map((v) => (
            <div key={v} className="rounded border border-muted-border bg-white p-1.5 text-center">
              <p className="text-[8px] text-muted">KPI</p>
              <p className="text-[10px] font-bold text-slate-900">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex h-20 gap-1.5">
          <div className="flex-1 rounded border border-muted-border bg-white p-1.5">
            <p className="text-[8px] font-semibold">Revenue Trend</p>
            <div className="mt-1 flex h-12 items-end gap-0.5">
              {[50, 70, 45, 85, 60, 90].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary/40" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="w-1/3 rounded border border-muted-border bg-white p-1.5">
            <p className="text-[8px] font-semibold">Dept.</p>
            <div className="mt-2 h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        </div>
      </div>
    ),
    patients: (
      <div className="p-3">
        <div className="mb-2 h-5 w-32 rounded bg-muted-bg" />
        <table className="w-full text-[8px]">
          <thead>
            <tr className="border-b border-muted-border text-left text-muted">
              <th className="pb-1">ID</th><th>Name</th><th>Phone</th><th>Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {[
              ['PAT-000001', 'Rahul V.', '+91 987…', 'Active'],
              ['PAT-000002', 'Anita D.', '+91 987…', 'Active'],
              ['PAT-000003', 'Suresh P.', '+91 987…', 'Active'],
            ].map(([id, name, phone, status]) => (
              <tr key={id} className="border-b border-muted-border/60">
                <td className="py-1 font-mono">{id}</td>
                <td className="py-1">{name}</td>
                <td className="py-1">{phone}</td>
                <td className="py-1"><span className="rounded-full bg-emerald-50 px-1 text-emerald-700">{status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    samples: (
      <div className="p-3">
        <div className="mb-2 flex gap-2">
          <div className="h-8 w-8 rounded border border-muted-border bg-white p-0.5">
            <div className="h-full w-full bg-[repeating-linear-gradient(90deg,#000_0,#000_1px,transparent_1px,transparent_3px)] opacity-30" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-slate-900">SMP-2026-0001</p>
            <p className="text-[8px] text-muted">BC20260001 · Blood</p>
          </div>
        </div>
        <div className="space-y-1">
          {['Registered', 'Collected', 'Processing', 'Completed'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 text-[8px]">
              <div className={`h-2 w-2 rounded-full ${i < 3 ? 'bg-primary' : 'bg-muted-border'}`} />
              <span className={i < 3 ? 'text-slate-900' : 'text-muted'}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    results: (
      <div className="p-3">
        <p className="mb-2 text-[9px] font-semibold text-slate-900">Result Entry — CBC</p>
        <div className="space-y-1.5">
          {[
            ['WBC', '7.2', '4.5–11.0', false],
            ['RBC', '4.8', '4.5–5.5', false],
            ['Glucose', '118', '70–100', true],
          ].map(([name, val, ref, critical]) => (
            <div key={name as string} className={`flex items-center justify-between rounded border px-2 py-1 text-[8px] ${critical ? 'border-red-200 bg-red-50' : 'border-muted-border bg-white'}`}>
              <span>{name}</span>
              <span className="font-semibold">{val}</span>
              <span className="text-muted">{ref}</span>
              {critical ? <span className="text-red-600">⚠</span> : null}
            </div>
          ))}
        </div>
      </div>
    ),
    reports: (
      <div className="p-3">
        <div className="rounded border border-muted-border bg-white p-2">
          <div className="flex items-center justify-between border-b border-muted-border pb-1">
            <p className="text-[9px] font-bold text-slate-900">LabCore Diagnostic</p>
            <div className="h-6 w-6 rounded bg-muted-bg" />
          </div>
          <p className="mt-1 text-[8px] text-muted">Patient: Rahul Verma · PAT-000001</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[8px]"><span>CBC</span><span className="font-medium">7.2 cells/µL</span></div>
            <div className="flex justify-between text-[8px]"><span>FBS</span><span className="font-medium text-red-600">118 mg/dL</span></div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-[7px] text-muted">Dr. Meera Iyer · Digitally Signed</div>
            <div className="h-8 w-8 rounded border border-dashed border-muted-border bg-muted-bg" />
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-[140px] bg-muted-bg">
      <div className="flex items-center gap-1.5 border-b border-muted-border bg-white px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </div>
      {screens[type]}
    </div>
  );
}
