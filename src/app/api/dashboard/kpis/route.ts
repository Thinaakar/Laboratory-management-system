import { getDashboardKpis as getKpisFromDb } from '@/lib/firestore/app-data';
import { ensureSeeded } from '@/lib/firestore/seed';
import { ensureDb, handleRouteError, jsonData, requireAuth } from '@/lib/api/route-helpers';
import { isFirebaseConfigured } from '@/lib/firebase/admin';
import { getDashboardKpis } from '@/lib/data/store';

export async function GET(request: Request) {
  try {
    if (isFirebaseConfigured()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
      return jsonData(await getKpisFromDb());
    }
    return jsonData(getDashboardKpis());
  } catch (e) {
    return handleRouteError(e);
  }
}
