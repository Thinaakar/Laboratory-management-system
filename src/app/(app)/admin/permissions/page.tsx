'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Save } from 'lucide-react';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { PermissionsMatrix } from '@/components/lims/access/permissions-matrix';
import { ALL_PERMISSION_IDS } from '@/lib/auth/permissions';
import type { LimsRole } from '@/lib/data/roles-store';
import { apiJson } from '@/lib/http/client';
import type { DbRole } from '@/lib/data/db-types';
import { cn } from '@/lib/utils';

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

export default function AdminPermissionsPage() {
  const [roles, setRoles] = useState<LimsRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [draft, setDraft] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoadError('');
    try {
      const res = await apiJson<{ data: DbRole[] }>('/api/roles');
      const list = res.data.map(toLimsRole).filter((r) => r.status === 'Active');
      setRoles(list);
      setSelectedRoleId((current) => current || list[0]?.id || '');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load roles.');
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) setDraft([...role.permissions]);
    setSaved(false);
  }, [selectedRoleId, roles]);

  const role = roles.find((r) => r.id === selectedRoleId);

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    try {
      await apiJson(`/api/roles/${role.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions: draft }),
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not save permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserManagementShell>
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

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
              <button
                type="button"
                onClick={() => void handleSave()}
                className="lims-btn-primary"
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : saved ? 'Saved' : 'Save Permissions'}
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
