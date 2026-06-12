'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/lims/page-header';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getResults } from '@/lib/data/store';
import { formatDateTime } from '@/lib/utils';

export default function ResultsPage() {
  const results = getResults();

  return (
    <div>
      <PageHeader
        title="Results"
        description="Test results and values"
        action={
          <Link href="/results/entry" className="lims-btn-primary">
            Enter Results
          </Link>
        }
      />

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Result ID</th>
              <th>Test</th>
              <th>Order</th>
              <th>Value</th>
              <th>Reference</th>
              <th>Critical</th>
              <th>Queue</th>
              <th>Approval</th>
              <th>Entered</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td className="font-mono text-xs">{r.id}</td>
                <td className="font-medium text-slate-900">{r.testName}</td>
                <td className="font-mono text-xs">{r.orderId}</td>
                <td>
                  {r.value}
                  {r.unit && <span className="ml-1 text-xs text-muted">{r.unit}</span>}
                </td>
                <td className="text-muted">{r.referenceRange ?? '—'}</td>
                <td>
                  {r.isCritical ? (
                    <StatusBadge label="Critical" variant="error" />
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td>
                  <StatusBadge label={r.queueStatus} variant={statusVariant(r.queueStatus)} />
                </td>
                <td>
                  <StatusBadge label={r.approvalStatus} variant={statusVariant(r.approvalStatus)} />
                </td>
                <td>{r.enteredAt ? formatDateTime(r.enteredAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
