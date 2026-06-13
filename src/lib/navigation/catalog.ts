/** @deprecated Catalog moved to Settings — use settings-nav.ts */

export const CATALOG_BASE = '/settings/tests';

export const CATALOG_PATHS = ['/tests', '/tests/packages'] as const;

export function isCatalogPath(pathname: string): boolean {
  return CATALOG_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
