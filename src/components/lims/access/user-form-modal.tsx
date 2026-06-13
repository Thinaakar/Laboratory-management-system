'use client';

import { useState } from 'react';
import type { LimsUser, UserRole } from '@/lib/types/lims';
import { getBranches } from '@/lib/data/store';
import { USER_ROLE_OPTIONS } from '@/lib/data/users-store';

interface UserFormModalProps {
  user?: LimsUser;
  onClose: () => void;
  onSave: (data: {
    displayName: string;
    email: string;
    role: UserRole;
    branchId?: string;
    status: LimsUser['status'];
  }) => void;
}

export function UserFormModal({ user, onClose, onSave }: UserFormModalProps) {
  const branches = getBranches();
  const isEdit = Boolean(user);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'Receptionist');
  const [branchId, setBranchId] = useState(user?.branchId ?? branches[0]?.id ?? '');
  const [status, setStatus] = useState<LimsUser['status']>(user?.status ?? 'Active');
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit User' : 'New User'}</h3>
        <p className="mt-1 text-sm text-muted">
          {isEdit ? 'Update staff account details and role assignment.' : 'Create a staff account and assign a role.'}
        </p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            try {
              onSave({
                displayName,
                email,
                role,
                branchId: branchId || undefined,
                status,
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : `Could not ${isEdit ? 'update' : 'create'} user.`);
            }
          }}
        >
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Full name</label>
            <input
              className="lims-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Email</label>
            <input
              type="email"
              className="lims-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@labcore.io"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Role</label>
            <select
              className="lims-input"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {USER_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Branch</label>
              <select
                className="lims-input"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Status</label>
              <select
                className="lims-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as LimsUser['status'])}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-muted">
            Demo note: login credentials are managed separately from this staff list.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              {isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
