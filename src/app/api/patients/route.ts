import { listPatients, getPatient } from '@/lib/firestore/app-data';
import { createPatient, deletePatientDb, updatePatientDb } from '@/lib/firestore/app-writes';
import { patientCreateSchema } from '@/lib/validation/entities';
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
      return jsonData(await listPatients());
    }
    return jsonData(await localApi.patients.list());
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = patientCreateSchema.parse(await parseJson(request));
    if (useRemoteDb()) {
      await ensureDb();
      const session = requireAuth(request);
      await requirePermission(session, 'patients.create');
      await ensureSeeded();
      return jsonData(await createPatient(body, session), 201);
    }
    requireAuth(request);
    return jsonData(await localApi.patients.create(body), 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
