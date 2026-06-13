'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Activity, Star } from 'lucide-react';
import { DashboardMockup } from './dashboard-mockup';

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgb(83 189 235 / 0.1) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgb(83 189 235 / 0.1) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Premium subtle glowing orbs */}
      <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] opacity-70" />
      <div className="absolute left-10 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[100px] opacity-50" />
      
      {/* Decorative clean line accents */}
      <svg className="absolute right-[5%] top-[10%] h-32 w-32 text-primary/10" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="10" fill="currentColor" className="animate-pulse" />
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-20 md:pt-20 md:pb-28 border-b border-slate-100">
      <HeroBackground />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-12">
          {/* Headline + Value Proposition */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-700 w-fit">
              <Shield size={13} />
              Enterprise Laboratory SaaS Platform
            </div>
            
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-[3.5rem] lg:leading-[1.1] font-display-premium">
              Modern Laboratory Operations,{' '}
              <span className="bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                Built for Scale.
              </span>
            </h1>
            
            <p className="mt-6 text-lg leading-relaxed text-slate-500 font-body-premium">
              LabCore connects patient registration, sample tracking, result validation, and report delivery in one intelligent platform — designed for modern pathology labs and diagnostics centers.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link href="/login" className="mkt-btn-primary px-7 py-3.5 text-base font-bold shadow-md hover:shadow-lg transition-all duration-150">
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>
            
            {/* Social proof trust bar */}
            <div className="mt-10 border-t border-slate-100 pt-6 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    U{n}
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                </div>
                <span className="font-bold text-slate-700">500+</span> diagnostics labs trust LabCore LIMS
              </div>
            </div>
          </div>

          {/* Interactive Live Dashboard Mockup */}
          <div className="lg:col-span-7 relative">
            <div className="relative mx-auto max-w-[620px] lg:max-w-none">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
