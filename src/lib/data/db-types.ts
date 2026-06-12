/** Firestore-backed user records (server only). */

export type UserStatus = 'Active' | 'Inactive';

export interface DbUser {
  id: string;
  displayName: string;
  email: string;
  passwordHash: string;
  role: string;
  branchId?: string;
  status: UserStatus;
  createdAt: string;
}

export type PublicUser = Omit<DbUser, 'passwordHash'>;

export const DEMO_USERS = [
  { id: 'USR-ADMIN', email: 'admin@labcore.io', password: 'Admin@123', displayName: 'System Admin', role: 'Admin' },
  { id: 'USR-RECEP', email: 'reception@labcore.io', password: 'Reception@123', displayName: 'Priya Sharma', role: 'Receptionist' },
  { id: 'USR-LAB', email: 'lab@labcore.io', password: 'Lab@123', displayName: 'Arun Kumar', role: 'Lab Technician' },
  { id: 'USR-PATH', email: 'pathologist@labcore.io', password: 'Path@123', displayName: 'Dr. Meera Iyer', role: 'Pathologist' },
] as const;

export const DEFAULT_BRANCH = {
  id: 'BR-MAIN',
  name: 'Main Laboratory',
  code: 'MAIN',
  isActive: true,
};
