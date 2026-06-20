import { listInvoices } from '@/lib/firestore/app-data';
import { recordInvoicePayment } from '@/lib/firestore/app-writes';
import { invoicePaymentSchema } from '@/lib/validation/entities';
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
import { localApi } from '@/lib/api/local-handlers';

export async function GET(request: Request) {
  try {
    if (useRemoteDb()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
      return jsonData(await listInvoices());
    }
    return jsonData(await localApi.invoices.list());
  } catch (e) {
    return handleRouteError(e);
  }
}
