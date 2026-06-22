/** Firestore-backed user records (server only). */

export type UserStatus = 'Active' | 'Inactive';

export interface DbUser {
  id: string;
  displayName: string;
  email: string;
  mobile: string;
  username: string;
  passwordHash: string;
  role: string;
  branchId?: string;
  department: string;
  status: UserStatus;
  createdAt: string;
}

export type PublicUser = Omit<DbUser, 'passwordHash'>;

export type RoleStatus = 'Active' | 'Inactive';

export interface DbRole {
  id: string;
  name: string;
  label: string;
  description: string;
  permissions: string[];
  color: string;
  status: RoleStatus;
  isSystem?: boolean;
}

/** Single admin seeded on first Firebase init (password from ADMIN_SEED_PASSWORD env). */
export const INITIAL_ADMIN = {
  id: 'USR-ADMIN',
  email: 'labsystem2026@gmail.com',
  username: 'admin',
  displayName: 'Lab System Admin',
  mobile: '',
  department: 'Administration',
  role: 'Admin',
} as const;

export function getAdminSeedPassword(): string {
  const password = process.env.ADMIN_SEED_PASSWORD?.trim();
  if (!password) {
    throw new Error('ADMIN_SEED_PASSWORD is not set. Add it to .env.local.');
  }
  return password;
}

export const DEFAULT_BRANCH = {
  id: 'BR-MAIN',
  name: 'Main Laboratory',
  code: 'MAIN',
  isActive: true,
};
