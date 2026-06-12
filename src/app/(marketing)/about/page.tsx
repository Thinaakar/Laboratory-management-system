import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About LabCore</p>
          <h1 className="mt-2 mkt-section-title">Laboratory software that works like your lab</h1>
        </div>
      </div>
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 space-y-6 text-muted leading-relaxed">
          <p>
            LabCore was built by a team that understands diagnostic laboratory operations — not generic software vendors. We designed every screen around real workflows: patient registration, sample collection, result entry, pathologist approval, and report delivery.
          </p>
          <p>
            Our mission is to give every diagnostic center — from single-branch pathology labs to multi-location networks — access to production-grade LIMS technology that is audit-ready, scalable, and fast for daily staff operations.
          </p>
          <p>
            LabCore is architected for SaaS deployment with branch management, role-based access control, and comprehensive audit logging from day one.
          </p>
          <Link href="/contact" className="mkt-btn-primary mt-4 inline-flex">Talk to Our Team</Link>
        </div>
      </section>
    </>
  );
}
