import { listAppointments } from '@/lib/firestore/app-data';
import { createAppointmentBooking } from '@/lib/firestore/app-writes';
import { appointmentCreateSchema } from '@/lib/validation/entities';
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
      return jsonData(await listAppointments());
    }
    return jsonData(await localApi.appointments.list());
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = appointmentCreateSchema.parse(await parseJson(request));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      requirePermission(session, 'appointments.create');
      await ensureSeeded();
      return jsonData(await createAppointmentBooking(body, session), 201);
    }
    requireAuth(request);
    return jsonData(await localApi.appointments.create(body), 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
