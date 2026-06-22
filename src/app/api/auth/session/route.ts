import { getSessionFromRequest } from '@/lib/auth/session';
import { getUserById, resolveRolePermissions, toPublicUser } from '@/lib/firestore/app-data';
import { ensureRolesSeeded } from '@/lib/firestore/seed';
import { handleRouteError, jsonData } from '@/lib/api/route-helpers';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return jsonData(null);

    if (isFirebaseConfigured()) {
      await ensureRolesSeeded();
      const user = await getUserById(session.userId);
      if (!user) return jsonData(null);
      const permissions = await resolveRolePermissions(user.role);
      return jsonData({ ...toPublicUser(user), permissions });
    }

    return jsonData({
      displayName: session.name,
      email: session.email,
      role: session.role,
      permissions: [],
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
