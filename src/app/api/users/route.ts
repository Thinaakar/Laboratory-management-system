import { listUsers, toPublicUser } from '@/lib/firestore/app-data';
import { createUserDb } from '@/lib/firestore/app-writes';
import { userCreateSchema } from '@/lib/validation/entities';
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
    const users = await listUsers();
    return jsonData(users.map(toPublicUser));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!useRemoteDb()) {
      return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
    }
    const body = userCreateSchema.parse(await parseJson(request));
    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'users.create');
    await ensureSeeded();
    return jsonData(await createUserDb(body, session), 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
