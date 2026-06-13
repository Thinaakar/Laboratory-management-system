import Link from 'next/link';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: 'Custom',
    period: '',
    desc: 'Single branch laboratories getting started with digital workflows.',
    features: ['Up to 500 orders/month', 'Patient & order management', 'Sample tracking', 'Basic reports', 'Email support'],
    featured: false,
  },
  {
    name: 'Professional',
    price: 'Custom',
    period: '',
    desc: 'Growing labs with multiple departments and advanced workflows.',
    features: ['Unlimited orders', 'Pathologist approval workflow', 'Report delivery notifications', 'Analytics dashboard', 'Inventory & equipment', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Multi-branch networks and SaaS deployment with dedicated SLA.',
    features: ['Multi-branch management', 'Custom integrations & API', 'Dedicated account manager', 'On-premise option', '99.9% uptime SLA', '24/7 phone support'],
    featured: false,
  },
];

export function PricingPreview() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Plans for every laboratory size
          </h2>
          <p className="mt-3 text-muted">Contact us for a plan tailored to your laboratory size and workflow.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-xl border p-6 ${
                p.featured
                  ? 'border-primary bg-primary-50/50 shadow-card-md ring-1 ring-primary/20'
                  : 'border-muted-border bg-white shadow-card'
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
              <p className="mt-3">
                <span className="text-3xl font-bold text-slate-900">{p.price}</span>
                <span className="text-sm text-muted">{p.period}</span>
              </p>
              <p className="mt-2 text-sm text-muted">{p.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold ${
                  p.featured ? 'mkt-btn-primary w-full' : 'mkt-btn-secondary w-full'
                }`}
              >
                Contact Sales
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
