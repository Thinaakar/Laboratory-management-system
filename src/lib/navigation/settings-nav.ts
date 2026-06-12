/** Settings section — lab configuration and master data. */

export const SETTINGS_BASE = '/settings';

export const SETTINGS_PATHS = [
  '/settings',
  '/settings/general',
  '/settings/tests',
  '/settings/packages',
  '/settings/departments',
  '/settings/doctors',
] as const;

export function isSettingsPath(pathname: string): boolean {
  return SETTINGS_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
