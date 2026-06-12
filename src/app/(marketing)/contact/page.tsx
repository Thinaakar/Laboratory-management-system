'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          organization: fd.get('organization') || undefined,
          message: fd.get('message') || undefined,
          source: 'contact',
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? 'Submission failed');
        return;
      }
      setSent(true);
    } catch {
      setError('Unable to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
          <h1 className="mt-2 mkt-section-title">Contact us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Reach out with questions about LabCore and how it fits your laboratory workflow.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Get in touch</h2>
            <ul className="mt-6 space-y-4 text-sm text-muted">
              <li><strong className="text-slate-900">Email:</strong> hello@labcore.io</li>
              <li><strong className="text-slate-900">Phone:</strong> +91 22 4000 1234</li>
              <li><strong className="text-slate-900">Address:</strong> 123 Health Park, BKC, Mumbai 400051</li>
            </ul>
            <p className="mt-6 text-sm text-muted">Response within 1 business day. Enterprise inquiries receive priority handling.</p>
          </div>

          <div className="rounded-xl border border-muted-border bg-white p-6 shadow-card">
            {sent ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                Thank you — our team will contact you within 1 business day.
              </p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} suppressHydrationWarning>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Name</label>
                  <input name="name" className="lims-input" placeholder="Your name" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                  <input name="email" type="email" className="lims-input" placeholder="you@lab.com" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Organization</label>
                  <input name="organization" className="lims-input" placeholder="Laboratory name" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Message</label>
                  <textarea name="message" className="lims-input" rows={4} placeholder="Tell us about your lab…" />
                </div>
                {error && <p className="text-sm text-error">{error}</p>}
                <button type="submit" disabled={loading} className="mkt-btn-primary w-full disabled:opacity-60">
                  {loading ? 'Submitting…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
