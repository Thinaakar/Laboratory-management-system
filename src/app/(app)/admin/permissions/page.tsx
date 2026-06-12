'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Save } from 'lucide-react';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { PermissionsMatrix } from '@/components/lims/access/permissions-matrix';
import { ALL_PERMISSION_IDS } from '@/lib/auth/permissions';
import { getRoles, updateRolePermissions, type LimsRole } from '@/lib/data/roles-store';
import { cn } from '@/lib/utils';

export default function AdminPermissionsPage() {
  const [roles, setRoles] = useState<LimsRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [draft, setDraft] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const refresh = () => {
    const list = getRoles().filter((r) => r.status === 'Active');
    setRoles(list);
    setSelectedRoleId((current) => current || list[0]?.id || '');
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) setDraft([...role.permissions]);
    setSaved(false);
  }, [selectedRoleId, roles]);

  const role = roles.find((r) => r.id === selectedRoleId);

  const handleSave = () => {
    if (!role) return;
    updateRolePermissions(role.id, draft);
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <UserManagementShell>
      <div className="lims-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Select role</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoleId(r.id)}
                  className={cn(
                    'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    selectedRoleId === r.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-border text-slate-600 hover:bg-muted-bg',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {role && (
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-muted">Granted</p>
                <p className="text-xl font-bold text-slate-900">
                  {draft.length}
                  <span className="text-sm font-normal text-muted"> / {ALL_PERMISSION_IDS.length}</span>
                </p>
              </div>
              <button type="button" onClick={handleSave} className="lims-btn-primary">
                <Save className="h-4 w-4" />
                {saved ? 'Saved' : 'Save Permissions'}
              </button>
            </div>
          )}
        </div>

        {role && (
          <div className="mt-4 rounded-lg border border-muted-border bg-muted-bg/50 p-4">
            <p className="text-sm font-medium text-slate-900">{role.label}</p>
            <p className="mt-1 text-sm text-muted">{role.description}</p>
            <Link
              href="/admin/roles"
              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            >
              Manage roles →
            </Link>
          </div>
        )}

        <div className="mt-6">
          <PermissionsMatrix selected={draft} onChange={setDraft} />
        </div>
      </div>
    </UserManagementShell>
  );
}
