import { listPatients } from '@/lib/firestore/app-data';
import { createPatient } from '@/lib/firestore/app-writes';
import { patientCreateSchema } from '@/lib/validation/entities';
import { ensureSeeded } from '@/lib/firestore/seed';
import { ensureDb, handleRouteError, jsonData, requireAuth } from '@/lib/api/route-helpers';
import { isFirebaseConfigured } from '@/lib/firebase/admin';
import { getPatients } from '@/lib/data/store';

export async function GET(request: Request) {
  try {
    if (isFirebaseConfigured()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
      return jsonData(await listPatients());
    }
    return jsonData(getPatients());
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!isFirebaseConfigured()) {
      return jsonData({ error: 'Firebase not configured' }, 503);
    }
    await ensureDb();
    const session = requireAuth(request);
    const body = patientCreateSchema.parse(await request.json());
    const patient = await createPatient(body);
    void session;
    return jsonData(patient, 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
