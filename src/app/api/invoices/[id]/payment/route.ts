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

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = invoicePaymentSchema.parse(await parseJson(request));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      await requirePermission(session, 'billing.update');
      await ensureSeeded();
      return jsonData(await recordInvoicePayment(id, body, session));
    }
    requireAuth(request);
    return jsonData(await localApi.invoices.recordPayment(id, body));
  } catch (e) {
    return handleRouteError(e);
  }
}
