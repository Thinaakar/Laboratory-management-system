'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusBadge } from '@/components/lims/status-badge';
import { UserDetailModal } from '@/components/lims/access/user-detail-modal';
import { UserFormModal, type UserFormData } from '@/components/lims/access/user-form-modal';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { TableRowActions } from '@/components/lims/table-row-actions';
import { apiJson } from '@/lib/http/client';
import type { PublicUser } from '@/lib/data/db-types';
import type { LimsUser } from '@/lib/types/lims';
import { INITIAL_ADMIN } from '@/lib/data/db-types';

function toLimsUser(user: PublicUser): LimsUser {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    mobile: user.mobile,
    username: user.username,
    role: user.role,
    department: user.department,
    status: user.status,
    branchId: user.branchId,
    createdAt: user.createdAt,
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<LimsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewUser, setViewUser] = useState<LimsUser | null>(null);
  const [editUser, setEditUser] = useState<LimsUser | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await apiJson<{ data: PublicUser[] }>('/api/users');
      setUsers(res.data.map(toLimsUser));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleDelete = async (user: LimsUser) => {
    if (!window.confirm(`Delete user "${user.displayName}"?`)) return;
    try {
      await apiJson(`/api/users/${user.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete user.');
    }
  };

  const handleCreate = async (data: UserFormData) => {
    if (!data.password) throw new Error('Password is required.');
    await apiJson('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setShowCreateModal(false);
    await refresh();
  };

  const handleUpdate = async (id: string, data: UserFormData) => {
    const body: Record<string, unknown> = { ...data };
    if (!data.password) delete body.password;
    await apiJson(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    setEditUser(null);
    await refresh();
  };

  return (
    <UserManagementShell>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowCreateModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New User
        </button>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th className="w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-muted">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-slate-900">{u.displayName}</td>
                  <td className="font-mono text-xs">{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.mobile || '—'}</td>
                  <td>{u.department}</td>
                  <td>{u.role}</td>
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
                      onDelete={u.id === INITIAL_ADMIN.id ? undefined : () => void handleDelete(u)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <UserFormModal onClose={() => setShowCreateModal(false)} onSave={handleCreate} />
      )}

      {editUser && (
        <UserFormModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(data) => handleUpdate(editUser.id, data)}
        />
      )}

      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}
    </UserManagementShell>
  );
}
