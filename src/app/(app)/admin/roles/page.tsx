'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { RoleDetailModal } from '@/components/lims/access/role-detail-modal';
import { RoleFormModal } from '@/components/lims/access/role-form-modal';
import { RolesTable } from '@/components/lims/access/roles-table';
import { getUserCountByRole, type LimsRole } from '@/lib/data/roles-store';
import { apiJson } from '@/lib/http/client';
import type { DbRole } from '@/lib/data/db-types';
import type { PublicUser } from '@/lib/data/db-types';

function toLimsRole(role: DbRole): LimsRole {
  return {
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: [...role.permissions],
    color: role.color,
    status: role.status,
    isSystem: role.isSystem,
  };
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<LimsRole[]>([]);
  const [users, setUsers] = useState<{ role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; role?: LimsRole } | null>(null);
  const [viewRole, setViewRole] = useState<LimsRole | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [rolesRes, usersRes] = await Promise.all([
        apiJson<{ data: DbRole[] }>('/api/roles'),
        apiJson<{ data: PublicUser[] }>('/api/users'),
      ]);
      setRoles(rolesRes.data.map(toLimsRole));
      setUsers(usersRes.data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load roles.');
      setRoles([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const countByRole = (name: string) => getUserCountByRole(name, users);

  const handleDelete = async (role: LimsRole) => {
    if (countByRole(role.name) > 0) {
      window.alert('Cannot delete: users are assigned to this role.');
      return;
    }
    if (!window.confirm(`Delete role "${role.label}"?`)) return;
    try {
      await apiJson(`/api/roles/${role.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete role.');
    }
  };

  return (
    <UserManagementShell>
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading roles…</p>
      ) : (
        <RolesTable
          roles={roles}
          getUserCountByRole={countByRole}
          onCreate={() => setModal({ mode: 'create' })}
          onView={(role) => setViewRole(role)}
          onEdit={(role) => setModal({ mode: 'edit', role })}
          onDelete={(role) => void handleDelete(role)}
        />
      )}

      {modal && (
        <RoleFormModal
          mode={modal.mode}
          role={modal.role}
          onClose={() => setModal(null)}
          onSave={async (data) => {
            try {
              if (modal.mode === 'create') {
                await apiJson('/api/roles', {
                  method: 'POST',
                  body: JSON.stringify({
                    label: data.label,
                    description: data.description,
                    status: data.status,
                    color: data.color,
                    permissions: data.permissions,
                  }),
                });
              } else if (modal.role) {
                await apiJson(`/api/roles/${modal.role.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({
                    label: data.label,
                    description: data.description,
                    status: data.status,
                    color: data.color,
                  }),
                });
              }
              setModal(null);
              await refresh();
            } catch (err) {
              window.alert(err instanceof Error ? err.message : 'Could not save role.');
            }
          }}
        />
      )}

      {viewRole && (
        <RoleDetailModal
          role={viewRole}
          userCount={countByRole(viewRole.name)}
          onClose={() => setViewRole(null)}
        />
      )}
    </UserManagementShell>
  );
}
