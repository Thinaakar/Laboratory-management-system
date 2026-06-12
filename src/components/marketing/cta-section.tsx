import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="bg-sidebar py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Ready to modernize your laboratory operations?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Join hundreds of diagnostic centers running on LabCore. Get in touch to learn how we fit your workflow.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-500">
            Contact Us
            <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
