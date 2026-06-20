import { listSamples } from '@/lib/firestore/app-data';
import { createSample } from '@/lib/firestore/app-writes';
import { sampleCreateSchema } from '@/lib/validation/entities';
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
      return jsonData(await listSamples());
    }
    return jsonData(await localApi.samples.list());
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = sampleCreateSchema.parse(await parseJson(request));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      requirePermission(session, 'samples.create');
      await ensureSeeded();
      return jsonData(await createSample(body, session), 201);
    }
    requireAuth(request);
    return jsonData(await localApi.samples.create(body), 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
