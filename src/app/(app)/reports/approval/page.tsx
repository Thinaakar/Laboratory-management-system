'use client';

import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge } from '@/components/lims/status-badge';
import { getLimsData } from '@/lib/api/use-lims-data';
import type { TestResult } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

function ApprovalContent() {
  const router = useRouter();
  const [pending, setPending] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const api = await getLimsData();
    const results = await api.results.list();
    setPending(results.filter((r) => r.approvalStatus === 'Pending'));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      const api = await getLimsData();
      await api.results.approve(id);
      router.push('/reports?success=approved');
    } catch {
      window.alert('Could not approve result.');
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActingId(id);
    try {
      const api = await getLimsData();
      await api.results.reject(id);
      router.push('/results?success=rejected');
    } catch {
      window.alert('Could not reject result.');
      setActingId(null);
    }
  };

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
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted">
                  Loading pending results…
                </td>
              </tr>
            ) : pending.length === 0 ? (
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
                        disabled={actingId === r.id}
                        onClick={() => void handleApprove(r.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="lims-btn-secondary px-3 py-1 text-xs"
                        disabled={actingId === r.id}
                        onClick={() => void handleReject(r.id)}
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
