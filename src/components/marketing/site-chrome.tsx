import Link from 'next/link';
import { Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { LabCoreLogo } from '@/components/lims/labcore-logo';
import { MARKETING_NAV } from '@/lib/navigation/modules';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-muted-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LabCoreLogo size="md" />
          <div>
            <span className="font-semibold text-slate-900">LabCore</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3" suppressHydrationWarning>
          <Link href="/login" className="mkt-btn-primary text-sm">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

const FOOTER_PRODUCT = [
  { label: 'Features', href: '/features' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Screenshots', href: '/screenshots' },
  { label: 'FAQ', href: '/faq' },
];

const FOOTER_COMPANY = [
  { label: 'About Us', href: '/about' },
  // { label: 'Blog', href: '/blog' }, // temporarily hidden
  { label: 'Contact', href: '/contact' },
];

const FOOTER_LEGAL = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
];

export function SiteFooter() {
  return (
    <footer className="bg-sidebar text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <LabCoreLogo size="sm" />
            <span className="font-semibold text-white">LabCore LIMS</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Production-grade laboratory information management for diagnostic centers, pathology labs, and health checkup facilities.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="https://linkedin.com" className="rounded-md border border-white/10 p-2 text-slate-400 hover:border-primary/50 hover:text-primary" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="https://twitter.com" className="rounded-md border border-white/10 p-2 text-slate-400 hover:border-primary/50 hover:text-primary" aria-label="Twitter">
              <Twitter size={16} />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {FOOTER_PRODUCT.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-white">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {FOOTER_COMPANY.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-white">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0 text-primary" />
              <a href="mailto:hello@labcore.io" className="hover:text-white">hello@labcore.io</a>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-primary" />
              <a href="tel:+912240001234" className="hover:text-white">+91 22 4000 1234</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>123 Health Park, Bandra Kurla Complex, Mumbai 400051</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-slate-500 sm:flex-row">
          <p suppressHydrationWarning>© {new Date().getFullYear()} LabCore Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            {FOOTER_LEGAL.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-white">{item.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
