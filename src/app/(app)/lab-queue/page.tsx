'use client';

import { Plus } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { EnterResultsModal } from '@/components/lims/results/enter-results-modal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getResults } from '@/lib/data/store';
import { formatDateTime } from '@/lib/utils';

function LabQueueContent() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const queue = getResults().filter((r) => r.queueStatus !== 'Completed');

  return (
    <>
      <PageHeader
        title="Lab Queue"
        description="Active tests awaiting processing"
        action={
          <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
            <Plus className="h-4 w-4" />
            Enter Results
          </button>
        }
      />

      <FlashBanner />

      <div className="lims-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="lims-table">
            <thead>
              <tr>
                <th>Result ID</th>
                <th>Test</th>
                <th>Sample</th>
                <th>Order</th>
                <th>Queue Status</th>
                <th>Entered By</th>
                <th>Entered</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No items in queue — all tests completed.
                  </td>
                </tr>
              ) : (
                queue.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs">{r.id}</td>
                    <td className="font-medium text-slate-900">{r.testName}</td>
                    <td className="font-mono text-xs">{r.sampleId}</td>
                    <td className="font-mono text-xs">{r.orderId}</td>
                    <td>
                      <StatusBadge label={r.queueStatus} variant={statusVariant(r.queueStatus)} />
                    </td>
                    <td>{r.enteredBy ?? '—'}</td>
                    <td>{r.enteredAt ? formatDateTime(r.enteredAt) : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <EnterResultsModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            router.push('/reports/approval?success=results');
          }}
        />
      )}
    </>
  );
}

export default function LabQueuePage() {
  return (
    <div>
      <Suspense fallback={null}>
        <LabQueueContent />
      </Suspense>
    </div>
  );
}
