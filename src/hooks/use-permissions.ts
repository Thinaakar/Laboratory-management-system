'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth/demo-users';
import { hasPermission } from '@/lib/auth/permissions';
import { getRolePermissions } from '@/lib/data/roles-store';

export function usePermissions() {
  const [permissionIds, setPermissionIds] = useState<string[] | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setPermissionIds(null);
      setRole(null);
      return;
    }
    setRole(session.role);
    setPermissionIds(getRolePermissions(session.role));
  }, []);

  const can = (permissionId: string): boolean => {
    if (role === 'Admin') return true;
    if (permissionIds === null) return true;
    return hasPermission(permissionIds, permissionId);
  };

  return { can, role };
}
