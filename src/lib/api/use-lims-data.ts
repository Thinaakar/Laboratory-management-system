'use client';

import { isApiMode, limsApi } from '@/lib/api/lims-client';
import { localApi } from '@/lib/api/local-handlers';

let cachedApiMode: boolean | null = null;

export async function getLimsData() {
  if (cachedApiMode === null) {
    cachedApiMode = await isApiMode();
  }
  return cachedApiMode ? limsApi : localApi;
}

export function resetApiModeCache() {
  cachedApiMode = null;
}
