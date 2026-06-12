/** Demo auth — replace with Firebase/session in production. */

export type SessionUser = { name: string; email: string; role: string };

const SESSION_KEY = 'labcore-session';

export const SUPER_ADMIN_DEMO = {
  email: 'admin@labcore.io',
  password: 'Admin@123',
  name: 'System Admin',
  role: 'Admin',
} as const;

export const DEMO_USERS = [SUPER_ADMIN_DEMO];

export function validateLogin(email: string, password: string): SessionUser | null {
  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!match) return null;
  return { name: match.name, email: match.email, role: match.role };
}

export function saveSession(user: SessionUser) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): SessionUser | null {
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
