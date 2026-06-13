'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusBadge } from '@/components/lims/status-badge';
import { UserDetailModal } from '@/components/lims/access/user-detail-modal';
import { UserFormModal } from '@/components/lims/access/user-form-modal';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { TableRowActions } from '@/components/lims/table-row-actions';
import { addUser, deleteUser, getUsers, updateUser } from '@/lib/data/users-store';
import type { LimsUser } from '@/lib/types/lims';

export default function UsersPage() {
  const [users, setUsers] = useState<LimsUser[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewUser, setViewUser] = useState<LimsUser | null>(null);
  const [editUser, setEditUser] = useState<LimsUser | null>(null);

  const refresh = () => setUsers(getUsers());

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = (user: LimsUser) => {
    if (!window.confirm(`Delete user "${user.displayName}"?`)) return;
    try {
      deleteUser(user.id);
      refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete user.');
    }
  };

  return (
    <UserManagementShell>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowCreateModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New User
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Status</th>
              <th className="w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium text-slate-900">{u.displayName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className="font-mono text-xs">{u.branchId ?? '—'}</td>
                <td>
                  <StatusBadge
                    label={u.status}
                    variant={u.status === 'Active' ? 'success' : 'neutral'}
                  />
                </td>
                <td>
                  <TableRowActions
                    onView={() => setViewUser(u)}
                    onEdit={() => setEditUser(u)}
                    onDelete={u.id === 'USR-ADMIN' ? undefined : () => handleDelete(u)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <UserFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={(data) => {
            addUser(data);
            setShowCreateModal(false);
            refresh();
          }}
        />
      )}

      {editUser && (
        <UserFormModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(data) => {
            updateUser(editUser.id, data);
            setEditUser(null);
            refresh();
          }}
        />
      )}

      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}
    </UserManagementShell>
  );
}
