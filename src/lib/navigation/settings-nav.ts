/** Settings section — general, master data, and stocks. */

export const SETTINGS_BASE = '/settings';

export const SETTINGS_GENERAL_PATHS = ['/settings', '/settings/general'] as const;

export const SETTINGS_MASTER_DATA_PATHS = [
  '/settings/tests',
  '/settings/packages',
  '/settings/departments',
  '/settings/sample-types',
  '/settings/doctors',
  '/settings/branches',
] as const;

export const SETTINGS_STOCKS_PATHS = [
  '/settings/inventory',
  '/settings/suppliers',
  '/settings/equipment',
] as const;

export const SETTINGS_PATHS = [
  ...SETTINGS_GENERAL_PATHS,
  ...SETTINGS_MASTER_DATA_PATHS,
  ...SETTINGS_STOCKS_PATHS,
] as const;

/** @deprecated Operations moved under Settings → Stocks */
export const LEGACY_OPERATIONS_PATHS = [
  '/inventory',
  '/suppliers',
  '/equipment',
] as const;

export function isSettingsGeneralPath(pathname: string): boolean {
  return SETTINGS_GENERAL_PATHS.some((p) => pathname === p);
}

export function isSettingsMasterDataPath(pathname: string): boolean {
  return SETTINGS_MASTER_DATA_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isSettingsStocksPath(pathname: string): boolean {
  return SETTINGS_STOCKS_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isSettingsPath(pathname: string): boolean {
  return SETTINGS_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isLegacyOperationsPath(pathname: string): boolean {
  return LEGACY_OPERATIONS_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export const LEGACY_OPERATIONS_REDIRECTS: Record<string, string> = {
  '/inventory': '/settings/inventory',
  '/suppliers': '/settings/suppliers',
  '/equipment': '/settings/equipment',
};

/** Any of these grants the Settings sidebar item */
export const SETTINGS_SIDEBAR_PERMISSIONS = [
  'settings.read',
  'tests.read',
  'inventory.read',
  'equipment.read',
] as const;

export function getDefaultSettingsPath(can: (permission: string) => boolean): string {
  if (can('settings.read')) return '/settings/general';
  if (can('tests.read')) return '/settings/tests';
  if (can('inventory.read')) return '/settings/inventory';
  if (can('equipment.read')) return '/settings/equipment';
  return '/settings/general';
}

export function canAccessSettingsPath(
  pathname: string,
  can: (permission: string) => boolean,
): boolean {
  if (isSettingsGeneralPath(pathname)) return can('settings.read');
  if (isSettingsMasterDataPath(pathname)) return can('tests.read');
  if (pathname === '/settings/inventory' || pathname.startsWith('/settings/inventory/')) {
    return can('inventory.read');
  }
  if (pathname === '/settings/suppliers' || pathname.startsWith('/settings/suppliers/')) {
    return can('inventory.read');
  }
  if (pathname === '/settings/equipment' || pathname.startsWith('/settings/equipment/')) {
    return can('equipment.read');
  }
  if (pathname === '/settings' || pathname === SETTINGS_BASE) {
    return SETTINGS_SIDEBAR_PERMISSIONS.some((p) => can(p));
  }
  return false;
}
