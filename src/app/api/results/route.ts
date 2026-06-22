import { listResults } from '@/lib/firestore/app-data';
import { enterResult } from '@/lib/firestore/app-writes';
import { resultEnterSchema } from '@/lib/validation/entities';
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

export async function GET(request: Request) {
  try {
    if (useRemoteDb()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
      return jsonData(await listResults());
    }
    return jsonData(await localApi.results.list());
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = resultEnterSchema.parse(await parseJson(request));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      await requirePermission(session, 'results.create');
      await ensureSeeded();
      return jsonData(await enterResult(body, session));
    }
    requireAuth(request);
    return jsonData(await localApi.results.enter(body));
  } catch (e) {
    return handleRouteError(e);
  }
}
