import { listTests, listPackages, listReferrals } from '@/lib/firestore/app-data';
import { ensureSeeded } from '@/lib/firestore/seed';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  requireAuth,
  useRemoteDb,
} from '@/lib/api/route-helpers';
import { localApi } from '@/lib/api/local-handlers';

export async function GET(request: Request) {
  try {
    if (useRemoteDb()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
      return jsonData(await listTests());
    }
    return jsonData(await localApi.catalog.tests());
  } catch (e) {
    return handleRouteError(e);
  }
}
