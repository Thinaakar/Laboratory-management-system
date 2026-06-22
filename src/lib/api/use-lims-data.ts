'use client';

import { isApiMode, limsApi } from '@/lib/api/lims-client';
import { localApi } from '@/lib/api/local-handlers';
import { clearLocalLimsStorage } from '@/lib/data/storage-utils';

let cachedApiMode: boolean | null = null;
let clearedLocalForRemote = false;

async function prepareRemoteMode(): Promise<void> {
  if (clearedLocalForRemote || typeof window === 'undefined') return;
  clearLocalLimsStorage();
  clearedLocalForRemote = true;
}

export async function getLimsData() {
  if (cachedApiMode === null) {
    cachedApiMode = await isApiMode();
    if (cachedApiMode) {
      await prepareRemoteMode();
    }
  }
  return cachedApiMode ? limsApi : localApi;
}

export function resetApiModeCache() {
  cachedApiMode = null;
  clearedLocalForRemote = false;
}

/** Call once on app shell mount so stale sessionStorage demo rows are cleared before pages load. */
export async function initLimsDataMode(): Promise<boolean> {
  const remote = await isApiMode();
  cachedApiMode = remote;
  if (remote) {
    await prepareRemoteMode();
  }
  return remote;
}
