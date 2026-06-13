'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Users', href: '/admin/users', permission: 'users.read' },
  { label: 'Roles', href: '/admin/roles', permission: 'users.read' },
  { label: 'Permissions', href: '/admin/permissions', permission: 'users.read' },
  { label: 'Audit Logs', href: '/admin/audit', permission: 'audit.read' },
];

export function AdminAccessTabs() {
  const pathname = usePathname();
  const { can } = usePermissions();
  const visible = TABS.filter((tab) => can(tab.permission));

  if (!visible.length) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-muted-border bg-white p-1">
      {visible.map((tab) => {
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
