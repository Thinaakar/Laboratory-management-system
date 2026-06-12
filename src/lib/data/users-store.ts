import type { LimsUser, UserRole } from '@/lib/types/lims';

const STORAGE_KEY = 'labcore-users-v1';

export const seedUsers: LimsUser[] = [
  { id: 'USR-ADMIN', displayName: 'System Admin', email: 'admin@labcore.io', role: 'Admin', status: 'Active', branchId: 'BR-MAIN', createdAt: '2026-01-01T00:00:00' },
  { id: 'USR-RECEP', displayName: 'Priya Sharma', email: 'reception@labcore.io', role: 'Receptionist', status: 'Active', branchId: 'BR-MAIN', createdAt: '2026-01-01T00:00:00' },
  { id: 'USR-LAB', displayName: 'Arun Kumar', email: 'lab@labcore.io', role: 'Lab Technician', status: 'Active', branchId: 'BR-MAIN', createdAt: '2026-01-01T00:00:00' },
  { id: 'USR-PATH', displayName: 'Dr. Meera Iyer', email: 'pathologist@labcore.io', role: 'Pathologist', status: 'Active', branchId: 'BR-MAIN', createdAt: '2026-01-01T00:00:00' },
];

function cloneSeed(): LimsUser[] {
  return seedUsers.map((u) => ({ ...u }));
}

function loadUsers(): LimsUser[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as LimsUser[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveUsers(users: LimsUser[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

let memoryUsers = cloneSeed();

export function getUsers(): LimsUser[] {
  if (typeof window !== 'undefined') {
    memoryUsers = loadUsers();
  }
  return memoryUsers.map((u) => ({ ...u }));
}

export function addUser(input: {
  displayName: string;
  email: string;
  role: UserRole;
  branchId?: string;
  status: LimsUser['status'];
}): LimsUser {
  const users = getUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error('A user with this email already exists.');
  }
  const created: LimsUser = {
    id: `USR-${Date.now()}`,
    displayName: input.displayName.trim(),
    email: input.email.trim(),
    role: input.role,
    branchId: input.branchId,
    status: input.status,
    createdAt: new Date().toISOString(),
  };
  memoryUsers = [...users, created];
  saveUsers(memoryUsers);
  return created;
}

export const USER_ROLE_OPTIONS: UserRole[] = [
  'Admin',
  'Receptionist',
  'Lab Technician',
  'Pathologist',
];
