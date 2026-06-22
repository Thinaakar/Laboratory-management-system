import { loginSchema } from '@/lib/validation/entities';
import { getUserByEmail, getUserByLogin, getUserByUsername, toPublicUser } from '@/lib/firestore/app-data';
import { verifyPassword } from '@/lib/auth/password-server';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session';
import { ensureSeeded } from '@/lib/firestore/seed';
import { ensureDb, handleRouteError, jsonData } from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());

    if (!isFirebaseConfigured()) {
      return apiError('Database not configured. Set FIREBASE_CREDENTIALS in .env.local.', 503);
    }

    await ensureDb();
    await ensureSeeded();
    const user = await getUserByLogin(body.email);
    if (!user || user.status !== 'Active' || !verifyPassword(body.password, user.passwordHash)) {
      return apiError('Invalid email/username or password', 401);
    }
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.displayName,
      role: user.role,
    });
    const res = jsonData(toPublicUser(user));
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    return handleRouteError(e);
  }
}
