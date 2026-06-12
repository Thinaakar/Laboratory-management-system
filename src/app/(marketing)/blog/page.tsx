import Link from 'next/link';

const POSTS = [
  { slug: 'lims-workflow-efficiency', title: '5 Ways LIMS Improves Lab Workflow Efficiency', excerpt: 'From sample registration to report delivery — how modern LIMS reduces turnaround time and errors.', date: '2026-05-15', category: 'Workflow' },
  { slug: 'saas-lims-multi-branch', title: 'Preparing Your Lab for Multi-Branch SaaS Deployment', excerpt: 'Branch management, data isolation, and centralized reporting for growing diagnostic networks.', date: '2026-04-28', category: 'Architecture' },
  { slug: 'pathologist-digital-signatures', title: 'Digital Signatures and Report Verification in Pathology', excerpt: 'QR verification, audit trails, and compliance-ready report approval workflows.', date: '2026-03-10', category: 'Compliance' },
];

export default function BlogPage() {
  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Blog</p>
          <h1 className="mt-2 mkt-section-title">Laboratory operations insights</h1>
        </div>
      </div>
      <section className="py-16">
        <div className="mx-auto max-w-3xl space-y-6 px-6">
          {POSTS.map((post) => (
            <article key={post.slug} className="rounded-xl border border-muted-border bg-white p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{post.title}</h2>
              <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</time>
                <Link href={`/blog/${post.slug}`} className="font-medium text-primary hover:underline">Read more →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
