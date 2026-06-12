import {
  Activity,
  BarChart3,
  Barcode,
  Beaker,
  ClipboardList,
  FileCheck,
  FlaskConical,
  Package,
  Settings,
  TestTube2,
  Users,
  Wallet,
} from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'Patient Management', desc: 'Registration, search, visit history, and demographics in one registry.' },
  { icon: TestTube2, title: 'Sample Tracking', desc: 'Full lifecycle from registration to completion with rejection workflow.' },
  { icon: Barcode, title: 'Barcode Management', desc: 'Auto-generated barcodes for accurate sample identification and tracking.' },
  { icon: FlaskConical, title: 'Laboratory Workflow', desc: 'Queue-based processing: pending → assigned → processing → completed.' },
  { icon: Beaker, title: 'Result Validation', desc: 'Reference ranges, critical flags, units, and revision history.' },
  { icon: FileCheck, title: 'Report Generation', desc: 'PDF reports with lab logo, digital signature, and QR verification.' },
  { icon: Wallet, title: 'Billing & Payments', desc: 'Invoices, GST, discounts, and cash/UPI/card payment tracking.' },
  { icon: Package, title: 'Inventory Management', desc: 'Reagents, consumables, low-stock alerts, and expiry tracking.' },
  { icon: Settings, title: 'Equipment Management', desc: 'Analyzer tracking, calibration schedules, and maintenance logs.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Revenue, test volume, referrals, and operational KPIs.' },
  { icon: ClipboardList, title: 'Order Management', desc: 'Test selection, health packages, and order status tracking.' },
  { icon: Activity, title: 'Audit & Compliance', desc: 'Complete audit trail for every critical operation.' },
];

export function FeaturesGrid() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Platform Capabilities</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Everything your laboratory needs
          </h2>
          <p className="mt-3 text-muted">
            Purpose-built modules for diagnostic centers — not generic CRUD pages.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-muted-border bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <f.icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
