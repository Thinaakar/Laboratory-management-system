/** Client session helpers (sessionStorage). */

export type SessionUser = { id: string; name: string; email: string; role: string };

const SESSION_KEY = 'labcore-session';

export function saveSession(user: Omit<SessionUser, 'id'> & { id?: string }) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): (SessionUser & { id?: string }) | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}
