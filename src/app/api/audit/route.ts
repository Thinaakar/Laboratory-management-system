import { listAuditLogs } from '@/lib/firestore/app-data';
import { ensureSeeded } from '@/lib/firestore/seed';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  requireAuth,
  requirePermission,
  useRemoteDb,
} from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';

export async function GET(request: Request) {
  try {
    if (!useRemoteDb()) {
      return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
    }
    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'audit.read');
    await ensureSeeded();
    return jsonData(await listAuditLogs());
  } catch (e) {
    return handleRouteError(e);
  }
}
