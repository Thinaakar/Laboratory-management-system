/** Demo auth for offline / non-Firebase mode. */

import { DEMO_USERS as DB_DEMO_USERS } from '@/lib/data/db-types';

export type SessionUser = { id: string; name: string; email: string; role: string };

const SESSION_KEY = 'labcore-session';

export const DEMO_USERS = DB_DEMO_USERS.map((u) => ({
  id: u.id,
  email: u.email,
  password: u.password,
  name: u.displayName,
  role: u.role,
}));

export const SUPER_ADMIN_DEMO = {
  email: DEMO_USERS[0].email,
  password: DEMO_USERS[0].password,
  name: DEMO_USERS[0].name,
  role: DEMO_USERS[0].role,
} as const;

export function validateLogin(email: string, password: string): SessionUser | null {
  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!match) return null;
  return { id: match.id, name: match.name, email: match.email, role: match.role };
}

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
