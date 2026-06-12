/** Catalog section — single sidebar entry; in-page tabs for sub-routes. */

export const CATALOG_BASE = '/tests';

export const CATALOG_PATHS = ['/tests', '/tests/packages'] as const;

export function isCatalogPath(pathname: string): boolean {
  return CATALOG_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
