'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import {
  isSettingsGeneralPath,
  isSettingsMasterDataPath,
  isSettingsStocksPath,
} from '@/lib/navigation/settings-nav';
import { cn } from '@/lib/utils';

const MASTER_DATA_TABS = [
  { label: 'Tests', href: '/settings/tests' },
  { label: 'Packages', href: '/settings/packages' },
  { label: 'Departments', href: '/settings/departments' },
  { label: 'Sample Types', href: '/settings/sample-types' },
  { label: 'Doctors', href: '/settings/doctors' },
  { label: 'Branches', href: '/settings/branches' },
];

const STOCKS_TABS = [
  { label: 'Inventory', href: '/settings/inventory', permission: 'inventory.read' },
  { label: 'Suppliers', href: '/settings/suppliers', permission: 'inventory.read' },
  { label: 'Equipment', href: '/settings/equipment', permission: 'equipment.read' },
];

function isTabActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsTabs() {
  const pathname = usePathname();
  const { can } = usePermissions();

  const canGeneral = can('settings.read');
  const canMasterData = can('tests.read');
  const visibleStockTabs = STOCKS_TABS.filter((tab) => can(tab.permission));
  const canStocks = visibleStockTabs.length > 0;
  const stocksSectionHref = visibleStockTabs[0]?.href ?? '/settings/inventory';

  const sections = [
    canGeneral && {
      label: 'General',
      href: '/settings/general',
      active: isSettingsGeneralPath(pathname),
    },
    canMasterData && {
      label: 'Master Data',
      href: '/settings/tests',
      active: isSettingsMasterDataPath(pathname),
    },
    canStocks && {
      label: 'Stocks',
      href: stocksSectionHref,
      active: isSettingsStocksPath(pathname),
    },
  ].filter(Boolean) as { label: string; href: string; active: boolean }[];

  const showMasterDataTabs = canMasterData && isSettingsMasterDataPath(pathname);
  const showStocksTabs = canStocks && isSettingsStocksPath(pathname);

  if (!sections.length) return null;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-1 rounded-lg border border-muted-border bg-white p-1">
        {sections.map((section) => (
          <Link
            key={section.label}
            href={section.href}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              section.active
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-muted-bg hover:text-slate-900',
            )}
          >
            {section.label}
          </Link>
        ))}
      </div>

      {showMasterDataTabs && (
        <div className="flex flex-wrap gap-1 rounded-lg border border-muted-border bg-slate-50 p-1">
          {MASTER_DATA_TABS.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white text-primary shadow-sm ring-1 ring-muted-border'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}

      {showStocksTabs && (
        <div className="flex flex-wrap gap-1 rounded-lg border border-muted-border bg-slate-50 p-1">
          {visibleStockTabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white text-primary shadow-sm ring-1 ring-muted-border'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
