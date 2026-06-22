import { getSampleType } from '@/lib/firestore/app-data';
import { deleteSampleTypeDb, updateSampleTypeDb } from '@/lib/firestore/catalog-writes';
import { sampleTypeUpdateSchema } from '@/lib/validation/catalog';
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
import { apiError } from '@/lib/http/api-error';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    if (!useRemoteDb()) {
      return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
    }
    const { id } = await params;
    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'tests.read');
    await ensureSeeded();
    const sampleType = await getSampleType(id);
    if (!sampleType) throw new NotFoundError('Sample type not found.');
    return jsonData(sampleType);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!useRemoteDb()) {
      return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
    }
    const { id } = await params;
    const body = sampleTypeUpdateSchema.parse(await parseJson(request));
    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'tests.create');
    await ensureSeeded();
    return jsonData(await updateSampleTypeDb(id, body, session));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    if (!useRemoteDb()) {
      return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
    }
    const { id } = await params;
    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'tests.create');
    await ensureSeeded();
    await deleteSampleTypeDb(id, session);
    return jsonData({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
