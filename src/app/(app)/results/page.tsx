'use client';

import { Plus } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { EnterResultsModal } from '@/components/lims/results/enter-results-modal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getResults } from '@/lib/data/store';
import { formatDateTime } from '@/lib/utils';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState(getResults());

  useEffect(() => {
    if (searchParams.get('entry') === '1') {
      setShowModal(true);
      window.history.replaceState(null, '', '/results');
    }
  }, [searchParams]);

  return (
    <>
      <PageHeader
        title="Results"
        description="Test results and values"
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

      {showModal && (
        <EnterResultsModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            setResults(getResults());
            router.push('/reports/approval?success=results');
          }}
        />
      )}
    </>
  );
}

export default function ResultsPage() {
  return (
    <div>
      <Suspense fallback={null}>
        <ResultsContent />
      </Suspense>
    </div>
  );
}
