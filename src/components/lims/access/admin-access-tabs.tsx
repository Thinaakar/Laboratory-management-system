'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Users', href: '/admin/users' },
  { label: 'Roles', href: '/admin/roles' },
  { label: 'Permissions', href: '/admin/permissions' },
];

export function AdminAccessTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-muted-border bg-white p-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
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
