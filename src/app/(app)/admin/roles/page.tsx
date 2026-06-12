'use client';

import { useEffect, useState } from 'react';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { RoleFormModal } from '@/components/lims/access/role-form-modal';
import { RolesTable } from '@/components/lims/access/roles-table';
import {
  addRole,
  deleteRole,
  getRoles,
  getUserCountByRole,
  updateRole,
  type LimsRole,
} from '@/lib/data/roles-store';
import { getUsers } from '@/lib/data/store';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<LimsRole[]>([]);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; role?: LimsRole } | null>(null);
  const users = getUsers();

  const refresh = () => setRoles(getRoles());

  useEffect(() => {
    refresh();
  }, []);

  const countByRole = (name: string) => getUserCountByRole(name, users);

  return (
    <UserManagementShell>
      <RolesTable
        roles={roles}
        getUserCountByRole={countByRole}
        onCreate={() => setModal({ mode: 'create' })}
        onEdit={(role) => setModal({ mode: 'edit', role })}
        onDelete={(role) => {
          if (countByRole(role.name) > 0) {
            window.alert('Cannot delete: users are assigned to this role.');
            return;
          }
          if (window.confirm(`Delete role "${role.label}"?`)) {
            deleteRole(role.id);
            refresh();
          }
        }}
      />

      {modal && (
        <RoleFormModal
          mode={modal.mode}
          role={modal.role}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.mode === 'create') {
              addRole({
                name: data.label,
                label: data.label,
                description: data.description,
                status: data.status,
                color: data.color,
                permissions: data.permissions,
              });
            } else if (modal.role) {
              updateRole(modal.role.id, {
                label: data.label,
                name: modal.role.isSystem ? modal.role.name : data.label,
                description: data.description,
                status: data.status,
                color: data.color,
              });
            }
            setModal(null);
            refresh();
          }}
        />
      )}
    </UserManagementShell>
  );
}
