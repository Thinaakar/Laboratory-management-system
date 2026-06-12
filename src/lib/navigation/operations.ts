/** Operations section — single sidebar entry; in-page tabs for sub-routes. */

export const OPERATIONS_BASE = '/inventory';

export const OPERATIONS_PATHS = [
  '/inventory',
  '/suppliers',
  '/equipment',
] as const;

export function isOperationsPath(pathname: string): boolean {
  return OPERATIONS_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
