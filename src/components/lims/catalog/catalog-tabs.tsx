'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Test Catalog', href: '/tests' },
  { label: 'Health Packages', href: '/tests/packages' },
];

function isTabActive(pathname: string, href: string): boolean {
  if (href === '/tests') {
    return pathname === '/tests';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CatalogTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-muted-border bg-white p-1">
      {TABS.map((tab) => {
        const active = isTabActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-muted-bg hover:text-slate-900',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
