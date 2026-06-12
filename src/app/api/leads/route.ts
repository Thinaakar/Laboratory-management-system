import { createLead } from '@/lib/firestore/app-writes';
import { leadCreateSchema } from '@/lib/validation/entities';
import { ensureDb, handleRouteError, jsonData } from '@/lib/api/route-helpers';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const body = leadCreateSchema.parse(await request.json());

    if (isFirebaseConfigured()) {
      await ensureDb();
      const lead = await createLead(body);
      return jsonData(lead, 201);
    }

    return jsonData({
      id: `LEAD-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      stored: false,
    }, 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
