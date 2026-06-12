import Link from 'next/link';
import { FeaturesGrid } from '@/components/marketing/features-grid';

export default function FeaturesPage() {
  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
          <h1 className="mt-2 mkt-section-title">Built for modern diagnostic laboratories</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Every module connects to the next step in your workflow — from patient registration to signed report delivery.
          </p>
          <Link href="/contact" className="mkt-btn-primary mt-8 inline-flex">
            Request a Demo
          </Link>
        </div>
      </div>
      <FeaturesGrid />
    </>
  );
}
