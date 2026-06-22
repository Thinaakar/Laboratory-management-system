/** Shared sessionStorage helpers — transactional stores start empty (no demo fallback). */

export function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify(data));
}

/** Catalog stores may still use built-in defaults when storage is empty. */
export function loadCatalogFromStorage<T>(key: string, catalogSeed: T[]): T[] {
  if (typeof window === 'undefined') return catalogSeed.map((item) => ({ ...item }));
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return catalogSeed.map((item) => ({ ...item }));
    const parsed = JSON.parse(raw) as T[];
    return parsed.length ? parsed : catalogSeed.map((item) => ({ ...item }));
  } catch {
    return catalogSeed.map((item) => ({ ...item }));
  }
}

export const LABCORE_STORAGE_KEYS = [
  'labcore-patients-v3',
  'labcore-orders-v1',
  'labcore-invoices-v1',
  'labcore-appointments-v1',
  'labcore-samples-v1',
  'labcore-results-v1',
  'labcore-packages-v1',
  'labcore-referrals-v1',
  'labcore-tests-v1',
  'labcore-departments-v1',
  'labcore-sample-types-v1',
  'labcore-branches-v1',
  'labcore-inventory-v1',
  'labcore-suppliers-v1',
  'labcore-equipment-v1',
  'labcore-audit-v1',
  'labcore-roles-v1',
  'labcore-users-v1',
] as const;

export function clearLocalLimsStorage(): void {
  if (typeof window === 'undefined') return;
  for (const key of LABCORE_STORAGE_KEYS) {
    sessionStorage.removeItem(key);
  }
}
