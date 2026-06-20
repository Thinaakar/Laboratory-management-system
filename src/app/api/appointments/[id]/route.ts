import { getAppointment } from '@/lib/firestore/app-data';
import { deleteAppointmentDb, updateAppointmentDb } from '@/lib/firestore/app-writes';
import { appointmentUpdateSchema } from '@/lib/validation/entities';
import { ensureSeeded } from '@/lib/firestore/seed';
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
import { localApi } from '@/lib/api/local-handlers';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (useRemoteDb()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
      const apt = await getAppointment(id);
      if (!apt) throw new NotFoundError('Appointment not found.');
      return jsonData(apt);
    }
    const items = await localApi.appointments.list();
    const apt = items.find((a) => a.id === id);
    if (!apt) throw new NotFoundError('Appointment not found.');
    return jsonData(apt);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = appointmentUpdateSchema.parse(await parseJson(request));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      requirePermission(session, 'appointments.update');
      await ensureSeeded();
      return jsonData(await updateAppointmentDb(id, body, session));
    }
    requireAuth(request);
    return jsonData(await localApi.appointments.update(id, body));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      requirePermission(session, 'appointments.update');
      await ensureSeeded();
      await deleteAppointmentDb(id, session);
      return jsonData({ ok: true });
    }
    requireAuth(request);
    return jsonData(await localApi.appointments.remove(id));
  } catch (e) {
    return handleRouteError(e);
  }
}
