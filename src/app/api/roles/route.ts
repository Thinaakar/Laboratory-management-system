import { listRoles } from '@/lib/firestore/app-data';
import { createRoleDb } from '@/lib/firestore/app-writes';
import { roleCreateSchema } from '@/lib/validation/entities';
import { ensureRolesSeeded, ensureSeeded } from '@/lib/firestore/seed';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  parseJson,
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
    await requirePermission(session, 'users.read');
    await ensureSeeded();
    await ensureRolesSeeded();
    return jsonData(await listRoles());
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!useRemoteDb()) {
      return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
    }
    const body = roleCreateSchema.parse(await parseJson(request));
    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'users.create');
    await ensureRolesSeeded();
    return jsonData(await createRoleDb(body, session), 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
