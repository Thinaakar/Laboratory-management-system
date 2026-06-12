'use client';

import { PageHeader } from '@/components/lims/page-header';
import { StatusBadge } from '@/components/lims/status-badge';
import { getBranches } from '@/lib/data/store';

export default function BranchesPage() {
  const branches = getBranches();

  return (
    <div>
      <PageHeader title="Branches" description="Multi-location laboratory management" />
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
                <td><StatusBadge label={b.isActive ? 'Active' : 'Inactive'} variant={b.isActive ? 'success' : 'neutral'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
