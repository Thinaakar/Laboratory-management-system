'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge } from '@/components/lims/status-badge';
import { getResults } from '@/lib/data/store';
import { logAuditAction } from '@/lib/audit/log-action';
import { formatDateTime } from '@/lib/utils';

function ApprovalContent() {
  const router = useRouter();
  const pending = getResults().filter((r) => r.approvalStatus === 'Pending');

  return (
    <>
      <FlashBanner />
      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Result ID</th>
              <th>Test</th>
              <th>Patient Order</th>
              <th>Value</th>
              <th>Critical</th>
              <th>Entered By</th>
              <th>Entered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted">
                  No results pending approval.
                </td>
              </tr>
            ) : (
              pending.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.id}</td>
                  <td className="font-medium text-slate-900">{r.testName}</td>
                  <td className="font-mono text-xs">{r.orderId}</td>
                  <td>
                    {r.value}
                    {r.unit && <span className="ml-1 text-xs text-muted">{r.unit}</span>}
                  </td>
                  <td>
                    {r.isCritical ? (
                      <StatusBadge label="Critical" variant="error" />
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td>{r.enteredBy ?? '—'}</td>
                  <td>{r.enteredAt ? formatDateTime(r.enteredAt) : '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="lims-btn-primary px-3 py-1 text-xs"
                        onClick={() => {
                          logAuditAction({
                            action: 'APPROVE',
                            module: 'reports',
                            details: `Approved result ${r.id} — ${r.testName}`,
                          });
                          router.push('/reports?success=approved');
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="lims-btn-secondary px-3 py-1 text-xs"
                        onClick={() => {
                          logAuditAction({
                            action: 'REJECT',
                            module: 'reports',
                            details: `Rejected result ${r.id} — ${r.testName}`,
                          });
                          router.push('/results?success=rejected');
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function ReportApprovalPage() {
  return (
    <div>
      <PageHeader title="Report Approval" description="Pathologist review of pending results" />
      <Suspense fallback={null}>
        <ApprovalContent />
      </Suspense>
    </div>
  );
}
