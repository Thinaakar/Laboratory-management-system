'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { BranchFormModal } from '@/components/lims/settings/branch-form-modal';
import { StatusBadge } from '@/components/lims/status-badge';
import { apiJson } from '@/lib/http/client';
import type { Branch } from '@/lib/types/lims';

export default function SettingsBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const res = await apiJson<{ data: Branch[] }>('/api/branches');
      setBranches(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load branches.');
      setBranches([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SettingsShell description="Multi-location laboratory branches">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Branch
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id}>
                <td className="font-mono text-xs">{b.code}</td>
                <td className="font-medium text-slate-900">{b.name}</td>
                <td>{b.address ?? '—'}</td>
                <td>{b.phone ?? '—'}</td>
                <td>
                  <StatusBadge
                    label={b.isActive ? 'Active' : 'Inactive'}
                    variant={b.isActive ? 'success' : 'neutral'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <BranchFormModal
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await apiJson('/api/branches', { method: 'POST', body: JSON.stringify(data) });
            setShowModal(false);
            await refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
