import { ALL_PERMISSION_IDS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/auth/permissions';

export type RoleStatus = 'Active' | 'Inactive';

export interface LimsRole {
  id: string;
  name: string;
  label: string;
  description: string;
  permissions: string[];
  color: string;
  status: RoleStatus;
  isSystem?: boolean;
}

const STORAGE_KEY = 'labcore-roles-v1';

/** Built-in super admin role — cannot be deleted. */
export const SUPER_ADMIN_ROLE_ID = 'role-admin';

export function isSuperAdminRole(role: Pick<LimsRole, 'id' | 'name'>): boolean {
  return role.id === SUPER_ADMIN_ROLE_ID || role.name === 'Admin';
}

const SEED_ROLES: LimsRole[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    label: 'Admin',
    description: 'Full system access including roles, permissions, and lab settings.',
    permissions: [...ALL_PERMISSION_IDS],
    color: 'primary',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-receptionist',
    name: 'Receptionist',
    label: 'Receptionist',
    description: 'Front desk — patients, appointments, orders, billing, and sample registration.',
    permissions: [...(DEFAULT_ROLE_PERMISSIONS.Receptionist ?? [])],
    color: 'blue',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-lab-tech',
    name: 'Lab Technician',
    label: 'Lab Technician',
    description: 'Sample processing, result entry, and inventory visibility.',
    permissions: [...(DEFAULT_ROLE_PERMISSIONS['Lab Technician'] ?? [])],
    color: 'emerald',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-pathologist',
    name: 'Pathologist',
    label: 'Pathologist',
    description: 'Result review, report approval, and analytics.',
    permissions: [...(DEFAULT_ROLE_PERMISSIONS.Pathologist ?? [])],
    color: 'violet',
    status: 'Active',
    isSystem: true,
  },
];

function loadRoles(): LimsRole[] {
  if (typeof window === 'undefined') return SEED_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));
    const parsed = JSON.parse(raw) as LimsRole[];
    return parsed.length ? parsed : SEED_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));
  } catch {
    return SEED_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));
  }
}

function saveRoles(roles: LimsRole[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
}

let memoryRoles = SEED_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));

export function getRoles(): LimsRole[] {
  if (typeof window !== 'undefined') {
    memoryRoles = loadRoles();
  }
  return memoryRoles.map((r) => ({ ...r, permissions: [...r.permissions] }));
}

export function getRoleById(id: string): LimsRole | undefined {
  return getRoles().find((r) => r.id === id);
}

export function getRoleByName(name: string): LimsRole | undefined {
  return getRoles().find((r) => r.name === name || r.label === name);
}

export function getRolePermissions(roleName: string): string[] {
  const role = getRoleByName(roleName);
  return role?.permissions ?? DEFAULT_ROLE_PERMISSIONS[roleName] ?? [];
}

export function getUserCountByRole(roleName: string, users: { role: string }[]): number {
  return users.filter((u) => u.role === roleName).length;
}

export function updateRolePermissions(roleId: string, permissions: string[]): LimsRole | null {
  const roles = getRoles();
  const idx = roles.findIndex((r) => r.id === roleId);
  if (idx < 0) return null;
  roles[idx] = { ...roles[idx], permissions: [...permissions] };
  memoryRoles = roles;
  saveRoles(roles);
  return roles[idx];
}

export function addRole(input: Omit<LimsRole, 'id'>): LimsRole {
  const roles = getRoles();
  const created: LimsRole = {
    ...input,
    id: `role-${Date.now()}`,
    permissions: [...input.permissions],
  };
  roles.push(created);
  memoryRoles = roles;
  saveRoles(roles);
  return created;
}

export function updateRole(roleId: string, patch: Partial<Omit<LimsRole, 'id'>>): LimsRole | null {
  const roles = getRoles();
  const idx = roles.findIndex((r) => r.id === roleId);
  if (idx < 0) return null;
  roles[idx] = {
    ...roles[idx],
    ...patch,
    permissions: patch.permissions ? [...patch.permissions] : roles[idx].permissions,
  };
  memoryRoles = roles;
  saveRoles(roles);
  return roles[idx];
}

export function deleteRole(roleId: string): boolean {
  const roles = getRoles();
  const role = roles.find((r) => r.id === roleId);
  if (!role || isSuperAdminRole(role)) return false;
  memoryRoles = roles.filter((r) => r.id !== roleId);
  saveRoles(memoryRoles);
  return true;
}

export function resetRolesToSeed(): void {
  memoryRoles = SEED_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));
  saveRoles(memoryRoles);
}
