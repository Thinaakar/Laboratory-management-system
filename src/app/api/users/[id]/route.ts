import { getUserById, toPublicUser } from '@/lib/firestore/app-data';
import { deleteUserDb, updateUserDb } from '@/lib/firestore/app-writes';
import { userUpdateSchema } from '@/lib/validation/entities';
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
    requireAuth(request);
    await ensureSeeded();
    const user = await getUserById(id);
    if (!user) throw new NotFoundError('User not found.');
    return jsonData(toPublicUser(user));
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
    const body = userUpdateSchema.parse(await parseJson(request));
    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'users.create');
    await ensureSeeded();
    return jsonData(await updateUserDb(id, body, session));
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
    await requirePermission(session, 'users.create');
    await ensureSeeded();
    await deleteUserDb(id, session);
    return jsonData({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
