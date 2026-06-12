'use client';

import { StatusBadge } from '@/components/lims/status-badge';
import { CatalogShell } from '@/components/lims/catalog/catalog-shell';
import { getTests } from '@/lib/data/store';
import { formatCurrency } from '@/lib/utils';

export default function TestsPage() {
  const tests = getTests();

  return (
    <CatalogShell>
      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Sample Type</th>
              <th>TAT (hrs)</th>
              <th>Unit</th>
              <th>Reference</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id}>
                <td className="font-mono text-xs">{t.id}</td>
                <td className="font-medium text-slate-900">{t.name}</td>
                <td>{t.departmentName}</td>
                <td>{t.sampleType}</td>
                <td>{t.turnaroundHours}</td>
                <td>{t.unit ?? '—'}</td>
                <td className="text-xs">{t.referenceRange ?? '—'}</td>
                <td>{formatCurrency(t.price)}</td>
                <td>
                  <StatusBadge label={t.isActive ? 'Active' : 'Inactive'} variant={t.isActive ? 'success' : 'neutral'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CatalogShell>
  );
}
