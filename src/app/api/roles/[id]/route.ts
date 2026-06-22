import { getRoleById } from '@/lib/firestore/app-data';
import {
  deleteRoleDb,
  updateRoleDb,
  updateRolePermissionsDb,
} from '@/lib/firestore/app-writes';
import { rolePermissionsSchema, roleUpdateSchema } from '@/lib/validation/entities';
import { ensureRolesSeeded } from '@/lib/firestore/seed';
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
    await ensureRolesSeeded();
    const role = await getRoleById(id);
    if (!role) throw new NotFoundError('Role not found.');
    return jsonData(role);
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
    const raw = await parseJson<Record<string, unknown>>(request);

    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'users.create');
    await ensureRolesSeeded();

    if (raw.permissions !== undefined) {
      const body = rolePermissionsSchema.parse(raw);
      return jsonData(await updateRolePermissionsDb(id, body, session));
    }

    const body = roleUpdateSchema.parse(raw);
    return jsonData(await updateRoleDb(id, body, session));
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
    await ensureRolesSeeded();
    await deleteRoleDb(id, session);
    return jsonData({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
