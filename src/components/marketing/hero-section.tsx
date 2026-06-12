'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingBrandHero } from './product-screen-preview';

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Medical grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgb(83 189 235 / 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgb(83 189 235 / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Soft glow */}
      <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      {/* Molecule SVG */}
      <svg className="absolute right-[10%] top-[15%] h-24 w-24 text-primary/15" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="30" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="80" cy="25" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="75" cy="75" r="5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="50" y1="50" x2="20" y2="30" stroke="currentColor" strokeWidth="1" />
        <line x1="50" y1="50" x2="80" y2="25" stroke="currentColor" strokeWidth="1" />
        <line x1="50" y1="50" x2="75" y2="75" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Microscope silhouette */}
      <svg className="absolute bottom-[10%] left-[5%] h-32 w-32 text-slate-200" viewBox="0 0 120 120" fill="currentColor">
        <path d="M60 15c-8 0-14 6-14 14v8h28v-8c0-8-6-14-14-14z" opacity="0.6" />
        <rect x="52" y="37" width="16" height="30" rx="2" opacity="0.5" />
        <ellipse cx="60" cy="75" rx="22" ry="8" opacity="0.4" />
        <rect x="35" y="85" width="50" height="6" rx="2" opacity="0.5" />
        <circle cx="60" cy="55" r="12" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      </svg>

      {/* Data viz bars */}
      <svg className="absolute right-[5%] bottom-[20%] h-20 w-28 text-primary/10" viewBox="0 0 112 80">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={i * 22 + 4} y={80 - (30 + i * 8)} width="14" height={30 + i * 8} rx="2" fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 md:pt-12 md:pb-24">
      <HeroBackground />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            Production-grade LIMS for diagnostic laboratories
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-[3.25rem] lg:leading-tight">
            Modern laboratory operations,{' '}
            <span className="text-primary">built for accuracy</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            LabCore connects patient registration, sample tracking, result validation, and report delivery in one enterprise platform — designed for pathology labs, diagnostic centers, and health checkup facilities.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="mkt-btn-primary">
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            Trusted by diagnostic labs across India · HIPAA-ready architecture · 99.9% uptime SLA
          </p>
        </div>
        <div className="relative lg:pl-4">
          <MarketingBrandHero />
        </div>
      </div>
    </section>
  );
}
