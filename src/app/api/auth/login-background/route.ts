import { isFirebaseConfigured } from '@/lib/firebase/admin';
import { getLoginBackgroundStorageUrl } from '@/lib/firebase/storage';
import { jsonData } from '@/lib/api/route-helpers';

const LOCAL_FALLBACK = '/images/lab-login-bg.svg';

export async function GET() {
  if (!isFirebaseConfigured()) {
    return jsonData({ url: LOCAL_FALLBACK, source: 'local' as const });
  }

  try {
    const url = await getLoginBackgroundStorageUrl();
    if (url) {
      return jsonData({ url, source: 'firebase' as const });
    }
  } catch {
    /* fall through to local asset */
  }

  return jsonData({ url: LOCAL_FALLBACK, source: 'local' as const });
}
