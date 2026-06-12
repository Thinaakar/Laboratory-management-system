import Link from 'next/link';
import { WorkflowTimeline } from '@/components/marketing/workflow-timeline';

const SOLUTIONS = [
  { title: 'Pathology Labs', desc: 'Histopathology workflows, pathologist approval, and signed report delivery.' },
  { title: 'Diagnostic Centers', desc: 'High-volume patient registration, multi-department test catalog, and billing.' },
  { title: 'Blood Testing Centers', desc: 'Sample barcode tracking, critical value alerts, and turnaround monitoring.' },
  { title: 'Health Checkup Centers', desc: 'Health packages, corporate screening, and automated report delivery workflows.' },
];

export default function SolutionsPage() {
  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Solutions</p>
          <h1 className="mt-2 mkt-section-title">Built for your type of laboratory</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            LabCore adapts to pathology, diagnostic, blood testing, and health checkup workflows.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2">
          {SOLUTIONS.map((s) => (
            <div key={s.title} className="rounded-xl border border-muted-border bg-white p-6 shadow-card">
              <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <WorkflowTimeline />

      <section className="py-12 text-center">
        <Link href="/contact" className="mkt-btn-primary inline-flex">Discuss Your Workflow</Link>
      </section>
    </>
  );
}
