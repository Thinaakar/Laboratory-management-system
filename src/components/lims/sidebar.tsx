'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Beaker,
  Building2,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  ScrollText,
  Settings,
  Shield,
  Stethoscope,
  TestTube2,
  Truck,
  UserCog,
  Users,
  Wallet,
  Wrench,
  Boxes,
  Layers,
} from 'lucide-react';
import { LabCoreLogo } from '@/components/lims/labcore-logo';
import { LIMS_NAV } from '@/lib/navigation/modules';
import { clearSession, getSession, type SessionUser } from '@/lib/auth/demo-users';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={18} />,
  Patients: <Users size={18} />,
  Appointments: <Calendar size={18} />,
  Orders: <ClipboardList size={18} />,
  Billing: <Wallet size={18} />,
  Samples: <TestTube2 size={18} />,
  Results: <Beaker size={18} />,
  'Report Approval': <ClipboardCheck size={18} />,
  Reports: <FileText size={18} />,
  Operations: <Layers size={18} />,
  Inventory: <Boxes size={18} />,
  Suppliers: <Truck size={18} />,
  Equipment: <Wrench size={18} />,
  Referrals: <Stethoscope size={18} />,
  Analytics: <BarChart3 size={18} />,
  'User Management': <UserCog size={18} />,
  'Users & Roles': <UserCog size={18} />,
  Users: <UserCog size={18} />,
  Roles: <Shield size={18} />,
  Permissions: <KeyRound size={18} />,
  Branches: <Building2 size={18} />,
  'Audit Logs': <ScrollText size={18} />,
  Settings: <Settings size={18} />,
};

function isNavActive(pathname: string, href: string, activePaths?: string[]): boolean {
  if (activePaths?.length) {
    return activePaths.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
  }
  if (pathname === href) return true;
  if (href === '/reports') {
    return pathname.startsWith('/reports') && !pathname.startsWith('/reports/approval');
  }
  return pathname.startsWith(`${href}/`);
}

export function LimsSidebar() {
  const pathname = usePathname();
  const { can } = usePermissions();
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  return (
    <aside className="lims-sidebar flex h-full w-60 shrink-0 flex-col border-r border-white/10">
      <div className="border-b border-white/10 px-4 py-4">
        <Link href="/dashboard" className="inline-flex">
          <LabCoreLogo size="md" priority />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {LIMS_NAV.map((group) => {
          const items = group.items.filter((item) => {
            if (item.permissions?.length) {
              return item.permissions.some((p) => can(p));
            }
            return !item.permission || can(item.permission);
          });
          if (!items.length) return null;
          const showGroupTitle = !(items.length === 1 && items[0].label === group.title);
          return (
            <div key={group.title}>
              {showGroupTitle && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isNavActive(pathname, item.href, item.activePaths);
                  return (
                    <li key={`${group.title}-${item.href}`}>
                      <Link
                        href={item.href}
                        className={cn('lims-nav-link', active && 'lims-nav-link-active')}
                      >
                        {ICONS[item.label] ?? <Activity size={18} />}
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <p className="truncate px-2 text-xs font-medium text-white">{session?.name ?? 'User'}</p>
        <p className="truncate px-2 text-[10px] text-slate-400">{session?.role ?? ''}</p>
        <button
          type="button"
          onClick={() => {
            clearSession();
            window.location.href = '/login';
          }}
          className="lims-nav-link mt-2 w-full text-left text-red-300 hover:text-red-200"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
