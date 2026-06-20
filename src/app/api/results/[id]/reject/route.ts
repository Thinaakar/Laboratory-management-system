import { rejectResult } from '@/lib/firestore/app-writes';
import { resultRejectSchema } from '@/lib/validation/entities';
import { ensureSeeded } from '@/lib/firestore/seed';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  parseJson,
  requireAuth,
  requirePermission,
  useRemoteDb,
} from '@/lib/api/route-helpers';
import { localApi } from '@/lib/api/local-handlers';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = resultRejectSchema.parse(await parseJson(request).catch(() => ({})));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      requirePermission(session, 'reports.approve');
      await ensureSeeded();
      return jsonData(await rejectResult(id, body, session));
    }
    const session = requireAuth(request);
    return jsonData(await localApi.results.reject(id, body, session.name));
  } catch (e) {
    return handleRouteError(e);
  }
}
