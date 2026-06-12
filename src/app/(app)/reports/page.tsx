'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getResults } from '@/lib/data/store';
import { formatDateTime } from '@/lib/utils';

function ReportsContent() {
  const reports = getResults().filter((r) => r.approvalStatus === 'Approved');

  return (
    <>
      <FlashBanner />
      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Result ID</th>
              <th>Test</th>
              <th>Order</th>
              <th>Value</th>
              <th>Status</th>
              <th>Approved By</th>
              <th>Approved</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted">
                  No approved reports yet. Complete pathologist approval to publish reports.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.id}</td>
                  <td className="font-medium text-slate-900">{r.testName}</td>
                  <td className="font-mono text-xs">{r.orderId}</td>
                  <td>
                    {r.value}
                    {r.unit && <span className="ml-1 text-xs text-muted">{r.unit}</span>}
                  </td>
                  <td>
                    <StatusBadge label={r.approvalStatus} variant={statusVariant(r.approvalStatus)} />
                  </td>
                  <td>{r.approvedBy ?? '—'}</td>
                  <td>{r.approvedAt ? formatDateTime(r.approvedAt) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Completed and approved patient reports" />
      <Suspense fallback={null}>
        <ReportsContent />
      </Suspense>
    </div>
  );
}
