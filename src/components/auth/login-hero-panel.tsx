'use client';

import {
  BarChart3,
  FileCheck2,
  ScanBarcode,
  Users,
} from 'lucide-react';
import { LabCoreLogo } from '@/components/lims/labcore-logo';
import { LoginDashboardPreview } from './login-dashboard-preview';

const FEATURES = [
  {
    icon: Users,
    title: 'Patient Management',
    desc: 'Register patients and maintain complete laboratory history.',
  },
  {
    icon: ScanBarcode,
    title: 'Sample Tracking',
    desc: 'Barcode-enabled sample collection and real-time monitoring.',
  },
  {
    icon: BarChart3,
    title: 'Result Validation',
    desc: 'Reference ranges, quality checks, and critical value alerts.',
  },
  {
    icon: FileCheck2,
    title: 'Smart Reporting',
    desc: 'PDF reports with QR verification and digital signatures.',
  },
];

const TRUST = [
  { value: '500+', label: 'Laboratories' },
  { value: '1M+', label: 'Reports Generated' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export function LoginHeroPanel() {
  return (
    <div className="relative flex min-h-[420px] w-full flex-col overflow-hidden bg-sidebar lg:min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a101f] via-sidebar to-[#152238]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(83,189,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(83,189,235,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

      <LoginDashboardPreview />

      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-10 xl:px-16">
        {/* Logo */}
        <div>
          <LabCoreLogo size="lg" priority />
        </div>

        {/* Headline + features */}
        <div className="my-8 lg:my-6">
          <h1 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]">
            Streamline Every{' '}
            <span className="text-primary">Laboratory Operation</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
            Manage patients, samples, testing workflows, results, billing, reporting, inventory, and
            laboratory operations from a single intelligent platform.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-white/[0.08]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                  <f.icon size={18} strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.label}>
              <p className="text-xl font-bold text-white sm:text-2xl">{t.value}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {t.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
