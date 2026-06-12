import { getSessionFromRequest } from '@/lib/auth/session';
import { getUserById, toPublicUser } from '@/lib/firestore/app-data';
import { handleRouteError, jsonData } from '@/lib/api/route-helpers';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return jsonData(null);

    if (isFirebaseConfigured()) {
      const user = await getUserById(session.userId);
      if (!user) return jsonData(null);
      return jsonData(toPublicUser(user));
    }

    return jsonData({
      displayName: session.name,
      email: session.email,
      role: session.role,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
