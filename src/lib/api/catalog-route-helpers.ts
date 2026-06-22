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
import type { SessionPayload } from '@/lib/auth/session';
import type { z } from 'zod';

export async function catalogList(
  request: Request,
  listFn: () => Promise<unknown[]>,
  permission = 'tests.read',
) {
  if (!useRemoteDb()) {
    return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
  }
  await ensureDb();
  const session = requireAuth(request);
  await requirePermission(session, permission);
  await ensureSeeded();
  return jsonData(await listFn());
}

export async function catalogCreate<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
  createFn: (body: z.infer<T>, session: SessionPayload) => Promise<unknown>,
  permission = 'tests.create',
) {
  if (!useRemoteDb()) {
    return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
  }
  const body = schema.parse(await parseJson(request));
  await ensureDb();
  const session = requireAuth(request);
  await requirePermission(session, permission);
  await ensureSeeded();
  return jsonData(await createFn(body, session), 201);
}

export function catalogError(e: unknown) {
  return handleRouteError(e);
}
