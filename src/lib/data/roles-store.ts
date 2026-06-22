/** Role types and pure helpers — persistence is in Firestore via /api/roles. */

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

/** Built-in super admin role — cannot be deleted. */
export const SUPER_ADMIN_ROLE_ID = 'role-admin';

export function isSuperAdminRole(role: Pick<LimsRole, 'id' | 'name'>): boolean {
  return role.id === SUPER_ADMIN_ROLE_ID || role.name === 'Admin';
}

export function getUserCountByRole(roleName: string, users: { role: string }[]): number {
  return users.filter((u) => u.role === roleName).length;
}
