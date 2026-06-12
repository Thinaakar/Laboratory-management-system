const FAQS = [
  { q: 'How long does implementation take?', a: 'Most single-branch labs go live within 2–4 weeks including data migration, staff training, and test catalog setup.' },
  { q: 'Does LabCore support NABL compliance?', a: 'Yes. Audit logs, revision history, pathologist approval trails, and equipment calibration tracking support accreditation requirements.' },
  { q: 'Can patients receive reports digitally?', a: 'Yes. LabCore supports PDF report generation with email and WhatsApp delivery after pathologist approval.' },
  { q: 'Do you support multi-branch operations?', a: 'Enterprise plan includes branch management with centralized reporting and branch-scoped data isolation.' },
  { q: 'What payment methods are supported for billing?', a: 'Cash, UPI, and card payments with partial payment tracking, GST, and discount support.' },
  { q: 'Is my data secure?', a: 'LabCore uses encrypted connections, role-based access, session management, and comprehensive audit logging for all critical operations.' },
];

export default function FaqPage() {
  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h1 className="mt-2 mkt-section-title">Frequently asked questions</h1>
        </div>
      </div>
      <section className="py-16">
        <div className="mx-auto max-w-3xl space-y-4 px-6">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-muted-border bg-white p-5 shadow-card">
              <summary className="cursor-pointer font-semibold text-slate-900 marker:content-none group-open:text-primary">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
