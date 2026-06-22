import { getSample } from '@/lib/firestore/app-data';
import { deleteSampleDb, updateSampleDb } from '@/lib/firestore/app-writes';
import { sampleUpdateSchema } from '@/lib/validation/entities';
import { ensureSeeded } from '@/lib/firestore/seed';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  NotFoundError,
  parseJson,
  requireAuth,
  requirePermission,
  useRemoteDb,
} from '@/lib/api/route-helpers';
import { localApi } from '@/lib/api/local-handlers';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (useRemoteDb()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
      const sample = await getSample(id);
      if (!sample) throw new NotFoundError('Sample not found.');
      return jsonData(sample);
    }
    const items = await localApi.samples.list();
    const sample = items.find((s) => s.id === id);
    if (!sample) throw new NotFoundError('Sample not found.');
    return jsonData(sample);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = sampleUpdateSchema.parse(await parseJson(request));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      await requirePermission(session, 'samples.update');
      await ensureSeeded();
      return jsonData(await updateSampleDb(id, body, session));
    }
    requireAuth(request);
    return jsonData(await localApi.samples.update(id, body));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      await requirePermission(session, 'samples.update');
      await ensureSeeded();
      await deleteSampleDb(id, session);
      return jsonData({ ok: true });
    }
    requireAuth(request);
    return jsonData(await localApi.samples.remove(id));
  } catch (e) {
    return handleRouteError(e);
  }
}
