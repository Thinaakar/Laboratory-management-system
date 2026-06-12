import Link from 'next/link';
import { ScreenshotsShowcase } from '@/components/marketing/screenshots-showcase';

export default function ScreenshotsPage() {
  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Product Tour</p>
          <h1 className="mt-2 mkt-section-title">See LabCore in action</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Enterprise-grade interfaces for receptionists, lab technicians, and pathologists.
          </p>
        </div>
      </div>
      <ScreenshotsShowcase />
      <section className="bg-muted-bg py-12 text-center">
        <Link href="/contact" className="mkt-btn-primary inline-flex">Book a Live Demo</Link>
      </section>
    </>
  );
}
