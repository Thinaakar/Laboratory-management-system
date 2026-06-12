import Link from 'next/link';
import { notFound } from 'next/navigation';

const POSTS: Record<string, { title: string; date: string; category: string; body: string[] }> = {
  'lims-workflow-efficiency': {
    title: '5 Ways LIMS Improves Lab Workflow Efficiency',
    date: '2026-05-15',
    category: 'Workflow',
    body: [
      'Modern diagnostic laboratories process hundreds of samples daily. A LIMS connects registration, billing, sample tracking, and reporting in one pipeline — eliminating duplicate data entry and manual handoffs.',
      'Barcode-based sample tracking reduces misidentification errors. Queue-based processing helps lab managers assign work and monitor turnaround times in real time.',
      'Pathologist approval workflows ensure every report is reviewed before release, with full audit trails for accreditation.',
    ],
  },
  'saas-lims-multi-branch': {
    title: 'Preparing Your Lab for Multi-Branch SaaS Deployment',
    date: '2026-04-28',
    category: 'Architecture',
    body: [
      'Growing diagnostic networks need centralized reporting with branch-scoped data. LabCore supports branch management from day one.',
      'Role-based access control ensures receptionists, technicians, and pathologists see only what they need.',
      'Cloud deployment reduces IT overhead while maintaining 99.9% uptime SLA for enterprise customers.',
    ],
  },
  'pathologist-digital-signatures': {
    title: 'Digital Signatures and Report Verification in Pathology',
    date: '2026-03-10',
    category: 'Compliance',
    body: [
      'Digital signatures on PDF reports provide legal validity and reduce paper handling.',
      'QR verification lets patients and referring doctors confirm report authenticity instantly.',
      'Revision history tracks every change to result values — who changed what and when.',
    ],
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{post.category}</p>
          <h1 className="mt-2 mkt-section-title">{post.title}</h1>
          <time className="mt-3 block text-sm text-muted" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
          </time>
        </div>
      </div>
      <article className="mx-auto max-w-3xl space-y-4 px-6 py-12 text-muted leading-relaxed">
        {post.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <Link href="/blog" className="inline-block pt-4 text-sm font-medium text-primary hover:underline">
          ← Back to blog
        </Link>
      </article>
    </>
  );
}
