import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    lab: 'Metro Diagnostic Center',
    role: 'Lab Director',
    name: 'Dr. Rajesh Khanna',
    rating: 5,
    quote: 'LabCore reduced our report turnaround time by 40%. The workflow from sample to signed PDF is seamless — our pathologists love the approval queue.',
  },
  {
    lab: 'HealthFirst Pathology',
    role: 'Operations Manager',
    name: 'Priya Nair',
    rating: 5,
    quote: 'We migrated from spreadsheets in two weeks. Patient registration, billing, and sample tracking are finally in one system. Support team is excellent.',
  },
  {
    lab: 'Apollo Diagnostics — Pune',
    role: 'Chief Pathologist',
    name: 'Dr. Meera Iyer',
    rating: 5,
    quote: 'Critical value flags and revision history give us the audit trail we need for NABL compliance. This is production-grade software, not a demo app.',
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted-bg py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Customer Stories</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Trusted by diagnostic laboratories
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.lab} className="rounded-xl border border-muted-border bg-white p-6 shadow-card">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-orange-300 text-orange-300" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 border-t border-muted-border pt-4">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-sm text-muted">{t.role}</p>
                <p className="mt-0.5 text-xs font-medium text-primary">{t.lab}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
