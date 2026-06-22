import { clearTransactionalFirestore } from '@/lib/firestore/seed';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  requireAuth,
  useRemoteDb,
} from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  try {
    if (!useRemoteDb()) {
      return jsonData(
        { message: 'Firebase is not configured. Clear sessionStorage manually in the browser.' },
        400,
      );
    }

    await ensureDb();
    const session = requireAuth(request);
    if (session.role !== 'Admin') {
      return jsonData({ message: 'Admin access required.' }, 403);
    }

    const result = await clearTransactionalFirestore();
    return jsonData({
      message: 'Transactional data cleared from Firestore.',
      deleted: result.deleted,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
