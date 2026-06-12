'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusBadge } from '@/components/lims/status-badge';
import { UserFormModal } from '@/components/lims/access/user-form-modal';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { addUser, getUsers } from '@/lib/data/users-store';
import type { LimsUser } from '@/lib/types/lims';

export default function UsersPage() {
  const [users, setUsers] = useState<LimsUser[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setUsers(getUsers());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserManagementShell>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserFormModal
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            addUser(data);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </UserManagementShell>
  );
}
