import { ProductScreenPreview, type ProductScreenType } from './product-screen-preview';

const SCREENS: { title: string; desc: string; type: ProductScreenType }[] = [
  { title: 'Dashboard', desc: 'Real-time KPIs, revenue trends, and quick actions for daily operations.', type: 'dashboard' },
  { title: 'Patient Management', desc: 'Search-first registry with visit history and demographics.', type: 'patients' },
  { title: 'Sample Tracking', desc: 'Barcode registration, status lifecycle, and rejection workflow.', type: 'samples' },
  { title: 'Result Entry', desc: 'Reference ranges, critical flags, and validation rules.', type: 'results' },
  { title: 'Report Generation', desc: 'Professional PDFs with digital signature and QR verification.', type: 'reports' },
];

export function ScreenshotsShowcase() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Product Preview</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            See LabCore in action
          </h2>
          <p className="mt-3 text-muted">
            Enterprise-grade interfaces designed for receptionists, lab technicians, and pathologists — not decorative dashboards.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SCREENS.map((s) => (
            <div key={s.title} className="group overflow-hidden rounded-xl border border-muted-border bg-white shadow-card transition-shadow hover:shadow-card-md">
              <div className="overflow-hidden rounded-t-xl border-b border-muted-border">
                <ProductScreenPreview type={s.type} />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 group-hover:text-primary">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
