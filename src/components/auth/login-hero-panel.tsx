'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Users,
  ScanBarcode,
  BarChart3,
  FileCheck2,
} from 'lucide-react';
import { LabCoreLogo } from '@/components/lims/labcore-logo';

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
  const [bgUrl, setBgUrl] = useState('/images/lab-login-bg.svg');
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    void fetch('/api/auth/login-background')
      .then((res) => res.json())
      .then((payload: { data?: { url?: string } }) => {
        if (payload.data?.url) setBgUrl(payload.data.url);
      })
      .catch(() => {
        /* keep local fallback */
      })
      .finally(() => setBgReady(true));
  }, []);

  return (
    <div className="relative flex min-h-[500px] w-full flex-col overflow-hidden lg:min-h-screen">
      {bgReady && (
        <Image
          src={bgUrl}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 60vw"
          aria-hidden
          unoptimized={bgUrl.startsWith('https://')}
        />
      )}

      {/* Light premium overlay — lab stays visible, text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-10 sm:px-10 lg:px-12 xl:px-14 lg:py-12">
        <div>
          <LabCoreLogo size="lg" priority />
        </div>

        <div className="my-8 lg:my-6 lg:max-w-xl">
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl xl:text-[2.65rem] xl:leading-[1.15]">
            Streamline Every{' '}
            <span className="text-primary">Laboratory Operation</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Manage patients, samples, workflows, billing, reporting, and laboratory operations from one intelligent platform.
          </p>

          {/* Feature cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-slate-200/80 bg-white/85 p-3.5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.icon size={16} strokeWidth={2} />
                </div>
                <h3 className="mt-2 text-xs font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-6 sm:grid-cols-4 lg:max-w-xl">
          {TRUST.map((t) => (
            <div key={t.label}>
              <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{t.value}</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                {t.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
