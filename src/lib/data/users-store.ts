import type { LimsUser, UserRole } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-users-v1';

export const seedUsers: LimsUser[] = [
  {
    id: 'USR-ADMIN',
    displayName: 'Lab System Admin',
    email: 'labsystem2026@gmail.com',
    mobile: '',
    username: 'admin',
    department: 'Administration',
    role: 'Admin',
    status: 'Active',
    branchId: 'BR-MAIN',
    createdAt: '2026-01-01T00:00:00',
  },
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
  mobile: string;
  username: string;
  department: LimsUser['department'];
  role: UserRole;
  branchId?: string;
  status: LimsUser['status'];
}): LimsUser {
  const users = getUsers();
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error('A user with this email already exists.');
  }
  if (users.some((u) => u.username.toLowerCase() === username)) {
    throw new Error('This username is already taken.');
  }
  const created: LimsUser = {
    id: `USR-${Date.now()}`,
    displayName: input.displayName.trim(),
    email: input.email.trim(),
    mobile: input.mobile.trim(),
    username,
    department: input.department,
    role: input.role,
    branchId: input.branchId,
    status: input.status,
    createdAt: new Date().toISOString(),
  };
  memoryUsers = [...users, created];
  saveUsers(memoryUsers);
  logAuditAction({
    action: 'CREATE',
    module: 'users',
    details: `Created user ${created.displayName} (${created.email})`,
  });
  return created;
}

export function updateUser(
  id: string,
  input: {
    displayName: string;
    email: string;
    mobile: string;
    username: string;
    department: LimsUser['department'];
    role: LimsUser['role'];
    branchId?: string;
    status: LimsUser['status'];
  },
): LimsUser {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error('User not found.');

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  if (users.some((u) => u.id !== id && u.email.toLowerCase() === email)) {
    throw new Error('A user with this email already exists.');
  }
  if (users.some((u) => u.id !== id && u.username.toLowerCase() === username)) {
    throw new Error('This username is already taken.');
  }

  const updated: LimsUser = {
    ...users[index],
    displayName: input.displayName.trim(),
    email: input.email.trim(),
    mobile: input.mobile.trim(),
    username,
    department: input.department,
    role: input.role,
    branchId: input.branchId,
    status: input.status,
  };

  memoryUsers = users.map((u) => (u.id === id ? updated : u));
  saveUsers(memoryUsers);
  logAuditAction({
    action: 'UPDATE',
    module: 'users',
    details: `Updated user ${updated.displayName} (${updated.email})`,
  });
  return updated;
}

export function deleteUser(id: string): void {
  if (id === 'USR-ADMIN') {
    throw new Error('Cannot delete the system admin account.');
  }
  const users = getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error('User not found.');
  memoryUsers = users.filter((u) => u.id !== id);
  saveUsers(memoryUsers);
  logAuditAction({
    action: 'DELETE',
    module: 'users',
    details: `Deleted user ${user.displayName} (${user.email})`,
  });
}

export const USER_ROLE_OPTIONS: UserRole[] = [
  'Admin',
  'Receptionist',
  'Lab Technician',
  'Pathologist',
];
