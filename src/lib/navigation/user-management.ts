/** User Management — single sidebar entry; in-page tabs for Users / Roles / Permissions. */

export const USER_MANAGEMENT_BASE = '/admin/users';

export const USER_MANAGEMENT_PATHS = [
  '/admin/users',
  '/admin/roles',
  '/admin/permissions',
  '/admin/audit',
] as const;

export function isUserManagementPath(pathname: string): boolean {
  return USER_MANAGEMENT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
