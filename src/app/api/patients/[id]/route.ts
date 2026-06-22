import { getPatient } from '@/lib/firestore/app-data';
import { deletePatientDb, updatePatientDb } from '@/lib/firestore/app-writes';
import { patientCreateSchema } from '@/lib/validation/entities';
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
      const patient = await getPatient(id);
      if (!patient) throw new NotFoundError('Patient not found.');
      return jsonData(patient);
    }
    requireAuth(request);
    const patients = await localApi.patients.list();
    const patient = patients.find((p) => p.id === id);
    if (!patient) throw new NotFoundError('Patient not found.');
    return jsonData(patient);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = patientCreateSchema.parse(await parseJson(request));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      await requirePermission(session, 'patients.update');
      await ensureSeeded();
      return jsonData(await updatePatientDb(id, body, session));
    }
    requireAuth(request);
    return jsonData(await localApi.patients.update(id, body));
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
      await requirePermission(session, 'patients.update');
      await ensureSeeded();
      await deletePatientDb(id, session);
      return jsonData({ ok: true });
    }
    requireAuth(request);
    return jsonData(await localApi.patients.remove(id));
  } catch (e) {
    return handleRouteError(e);
  }
}
