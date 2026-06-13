'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { BranchFormModal } from '@/components/lims/settings/branch-form-modal';
import { StatusBadge } from '@/components/lims/status-badge';
import { addBranch, getBranches } from '@/lib/data/branches-store';
import type { Branch } from '@/lib/types/lims';

export default function SettingsBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setBranches(getBranches());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsShell description="Multi-location laboratory branches">
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
          onSave={(data) => {
            addBranch(data);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
