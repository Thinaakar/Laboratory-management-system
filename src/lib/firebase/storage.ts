import { getStorage } from 'firebase-admin/storage';
import { getAdminApp } from '@/lib/firebase/admin';

/** Object path in the default Firebase Storage bucket. */
export const LOGIN_BACKGROUND_STORAGE_PATH = 'lims/assets/login-background';

const SIGNED_URL_TTL_MS = 60 * 60 * 1000;

export function getStorageBucketName(): string {
  const fromEnv = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (fromEnv) return fromEnv;
  const projectId = getAdminApp().options.projectId;
  if (!projectId) throw new Error('Firebase project ID is not available for Storage.');
  // Modern Firebase projects use .firebasestorage.app (not legacy .appspot.com).
  return `${projectId}.firebasestorage.app`;
}

export function getAdminStorageBucket() {
  return getStorage(getAdminApp()).bucket(getStorageBucketName());
}

function storagePathWithExt(ext: 'jpg' | 'svg'): string {
  return `${LOGIN_BACKGROUND_STORAGE_PATH}.${ext}`;
}

export async function getLoginBackgroundStorageUrl(): Promise<string | null> {
  const bucket = getAdminStorageBucket();
  for (const ext of ['jpg', 'svg'] as const) {
    const file = bucket.file(storagePathWithExt(ext));
    const [exists] = await file.exists();
    if (!exists) continue;
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + SIGNED_URL_TTL_MS,
    });
    return url;
  }
  return null;
}
