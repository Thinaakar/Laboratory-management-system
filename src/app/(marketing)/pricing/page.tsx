import Link from 'next/link';
import { PricingPreview } from '@/components/marketing/pricing-preview';

export default function PricingPage() {
  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h1 className="mt-2 mkt-section-title">Plans for every lab size</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Choose Starter, Professional, or Enterprise — contact our team for a custom quote.
          </p>
        </div>
      </div>
      <PricingPreview />
      <section className="border-t border-muted-border bg-muted-bg py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Need a custom quote?</h2>
          <p className="mt-2 text-muted">Our team will tailor a plan for your laboratory volume and branch count.</p>
          <Link href="/contact" className="mkt-btn-primary mt-6 inline-flex">Contact Sales</Link>
        </div>
      </section>
    </>
  );
}
