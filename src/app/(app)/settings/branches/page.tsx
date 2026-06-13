'use client';

import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { StatusBadge } from '@/components/lims/status-badge';
import { getBranches } from '@/lib/data/store';

export default function SettingsBranchesPage() {
  const branches = getBranches();

  return (
    <SettingsShell description="Multi-location laboratory branches">
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
    </SettingsShell>
  );
}
