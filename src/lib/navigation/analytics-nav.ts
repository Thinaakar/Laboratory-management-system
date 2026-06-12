/** Analytics section — single sidebar entry; in-page tabs for sub-routes. */

export const ANALYTICS_BASE = '/analytics';

export const ANALYTICS_PATHS = ['/analytics'] as const;
// '/referrals' — temporarily hidden

export function isAnalyticsPath(pathname: string): boolean {
  return ANALYTICS_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
