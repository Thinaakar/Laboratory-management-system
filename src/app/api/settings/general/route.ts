import { getGeneralSettingsOrDefault } from '@/lib/firestore/app-data';
import { saveGeneralSettingsDb } from '@/lib/firestore/catalog-writes';
import { generalSettingsSchema } from '@/lib/validation/catalog';
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
    requireAuth(request);
    await ensureSeeded();
    return jsonData(await getGeneralSettingsOrDefault());
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    if (!useRemoteDb()) {
      return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
    }
    const body = generalSettingsSchema.parse(await parseJson(request));
    await ensureDb();
    const session = requireAuth(request);
    await requirePermission(session, 'settings.update');
    await ensureSeeded();
    return jsonData(await saveGeneralSettingsDb(body, session));
  } catch (e) {
    return handleRouteError(e);
  }
}
