import { getNextBarcodeFromDb } from '@/lib/firestore/app-writes';
import { ensureSeeded } from '@/lib/firestore/seed';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  requireAuth,
  useRemoteDb,
} from '@/lib/api/route-helpers';
import { localApi } from '@/lib/api/local-handlers';

export async function GET(request: Request) {
  try {
    if (useRemoteDb()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
      return jsonData({ barcode: await getNextBarcodeFromDb() });
    }
    return jsonData(await localApi.samples.nextBarcode());
  } catch (e) {
    return handleRouteError(e);
  }
}
