'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { LimsUser } from '@/lib/types/lims';
import { apiJson } from '@/lib/http/client';
import type { DbRole } from '@/lib/data/db-types';

export type UserFormData = {
  displayName: string;
  email: string;
  mobile: string;
  username: string;
  password?: string;
  role: string;
  status: LimsUser['status'];
};

interface UserFormModalProps {
  user?: LimsUser;
  onClose: () => void;
  onSave: (data: UserFormData) => void | Promise<void>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="border-b border-slate-100 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
      {children}
    </h4>
  );
}

export function UserFormModal({ user, onClose, onSave }: UserFormModalProps) {
  const isEdit = Boolean(user);
  const [roleOptions, setRoleOptions] = useState<{ name: string; label: string }[]>([]);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [mobile, setMobile] = useState(user?.mobile ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(user?.role ?? '');
  const [status, setStatus] = useState<LimsUser['status']>(user?.status ?? 'Active');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void apiJson<{ data: DbRole[] }>('/api/roles')
      .then((res) => {
        const active = res.data.filter((r) => r.status === 'Active');
        setRoleOptions(active.map((r) => ({ name: r.name, label: r.label })));
        if (!user?.role && active.length > 0) {
          setRole(active.find((r) => r.name === 'Receptionist')?.name ?? active[0].name);
        }
      })
      .catch(() => {
        setRoleOptions([
          { name: 'Admin', label: 'Admin' },
          { name: 'Receptionist', label: 'Receptionist' },
          { name: 'Lab Technician', label: 'Lab Technician' },
          { name: 'Pathologist', label: 'Pathologist' },
        ]);
        if (!user?.role) setRole('Receptionist');
      });
  }, [user?.role]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit User' : 'New User'}</h3>
          <p className="mt-1 text-sm text-muted">
            {isEdit
              ? 'Update staff account. Leave password blank to keep the current password.'
              : 'Create a staff account with login credentials stored securely in Firebase.'}
          </p>
        </div>

        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            if (!role) {
              setError('Select a role.');
              return;
            }
            if (!isEdit) {
              if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
              }
              if (password !== confirmPassword) {
                setError('Password and confirm password do not match.');
                return;
              }
            } else if (password) {
              if (password.length < 6) {
                setError('New password must be at least 6 characters.');
                return;
              }
              if (password !== confirmPassword) {
                setError('Password and confirm password do not match.');
                return;
              }
            }
            setSaving(true);
            try {
              await onSave({
                displayName,
                email,
                mobile,
                username,
                password: password || undefined,
                role,
                status,
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : `Could not ${isEdit ? 'update' : 'create'} user.`);
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <section className="space-y-3">
              <SectionTitle>Personal Information</SectionTitle>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Full Name *</label>
                <input
                  className="lims-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Email Address *</label>
                  <input
                    type="email"
                    className="lims-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@gmail.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Mobile Number *</label>
                  <input
                    type="tel"
                    className="lims-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <SectionTitle>Account Information</SectionTitle>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Username *</label>
                <input
                  className="lims-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  pattern="[a-zA-Z0-9._-]+"
                  placeholder="e.g. jane.doe"
                  autoComplete="username"
                />
                <p className="mt-1 text-xs text-muted">Used for sign-in along with email.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Password {isEdit ? '(optional)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="lims-input pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!isEdit}
                      minLength={isEdit ? undefined : 6}
                      placeholder={isEdit ? 'Leave blank to keep' : 'Min. 6 characters'}
                      autoComplete={isEdit ? 'new-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Confirm Password {isEdit ? '(optional)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="lims-input pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isEdit}
                      placeholder={isEdit ? 'Confirm new password' : 'Re-enter password'}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <SectionTitle>Role Assignment</SectionTitle>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Role *</label>
                <select
                  className="lims-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  {roleOptions.length === 0 ? (
                    <option value="">Loading roles…</option>
                  ) : (
                    roleOptions.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </section>

            <section className="space-y-3">
              <SectionTitle>Account Status</SectionTitle>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Status *</label>
                <select
                  className="lims-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LimsUser['status'])}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button type="button" onClick={onClose} className="lims-btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary" disabled={saving || !role}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
