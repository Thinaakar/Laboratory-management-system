/** Settings section — master data and lab configuration. */

export const SETTINGS_BASE = '/settings';

export const SETTINGS_PATHS = [
  '/settings',
  '/settings/general',
  '/settings/tests',
  '/settings/packages',
  '/settings/departments',
  '/settings/doctors',
  '/settings/branches',
] as const;

export function isSettingsPath(pathname: string): boolean {
  return SETTINGS_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
