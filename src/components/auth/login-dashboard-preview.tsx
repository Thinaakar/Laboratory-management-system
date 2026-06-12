'use client';

/** Decorative blurred LIMS dashboard mock — background only, not interactive */

export function LoginDashboardPreview() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.22] blur-[2px]"
      aria-hidden
    >
      <div className="absolute -right-8 top-8 w-[520px] rotate-[-4deg] rounded-2xl border border-white/10 bg-[#1a2332] p-4 shadow-2xl">
        <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
          <div className="h-7 w-7 rounded-md bg-primary/30" />
          <div className="space-y-1">
            <div className="h-2 w-24 rounded bg-white/20" />
            <div className="h-1.5 w-16 rounded bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-white/5 bg-white/5 p-2">
              <div className="h-1.5 w-8 rounded bg-primary/40" />
              <div className="mt-2 h-4 w-10 rounded bg-white/15" />
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {[40, 65, 50, 80, 55, 70, 45, 90, 60, 75].map((h, i) => (
            <div
              key={i}
              className="rounded-t bg-primary/30"
              style={{ height: `${h * 0.35}px` }}
            />
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {['SMP-2026-0041 · CBC', 'SMP-2026-0042 · LFT', 'SMP-2026-0043 · TSH'].map((row) => (
            <div key={row} className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5">
              <span className="text-[9px] text-white/50">{row}</span>
              <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[8px] text-amber-200">Pending</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-24 left-4 w-44 rotate-[3deg] rounded-xl border border-white/10 bg-[#1a2332]/90 p-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded border border-dashed border-primary/40 bg-primary/10" />
          <div>
            <div className="h-1.5 w-16 rounded bg-white/20" />
            <div className="mt-1 h-1 w-12 rounded bg-primary/30" />
          </div>
        </div>
        <div className="mt-2 font-mono text-[8px] text-primary/60">BC20260441</div>
      </div>

      <div className="absolute left-[28%] top-[42%] w-36 rounded-xl border border-white/10 bg-[#1a2332]/80 p-3">
        <div className="text-[8px] uppercase tracking-wider text-white/40">Sample queue</div>
        <div className="mt-2 space-y-1">
          {['Processing', 'Received', 'Collected'].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-white/20'}`} />
              <span className="text-[9px] text-white/45">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
