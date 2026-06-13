'use client';

import { Download, Plus } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { EnterResultsModal } from '@/components/lims/results/enter-results-modal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getResults } from '@/lib/data/store';
import { downloadTableCsv } from '@/lib/utils/csv';
import { cn, formatDateTime } from '@/lib/utils';

type ResultsFilter = 'all' | 'pending';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<ResultsFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState(getResults());

  const refresh = useCallback(() => {
    setResults(getResults());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get('filter') === 'pending') {
      setFilter('pending');
    }

    if (searchParams.get('entry') === '1') {
      setFilter('pending');
      setShowModal(true);
    }

    if (searchParams.get('entry') === '1' || searchParams.has('filter')) {
      const next = new URLSearchParams();
      if (searchParams.get('filter') === 'pending' || searchParams.get('entry') === '1') {
        next.set('filter', 'pending');
      }
      const success = searchParams.get('success');
      if (success) {
        next.set('success', success);
      }
      const qs = next.toString();
      window.history.replaceState(null, '', qs ? `/results?${qs}` : '/results');
    }
  }, [searchParams]);

  const displayed = useMemo(() => {
    if (filter === 'pending') {
      return results.filter((r) => r.queueStatus !== 'Completed');
    }
    return results;
  }, [results, filter]);

  const setFilterAndUrl = (next: ResultsFilter) => {
    setFilter(next);
    const params = new URLSearchParams(window.location.search);
    if (next === 'pending') {
      params.set('filter', 'pending');
    } else {
      params.delete('filter');
    }
    const qs = params.toString();
    router.replace(qs ? `/results?${qs}` : '/results', { scroll: false });
  };

  return (
    <>
      <PageHeader
        title="Results"
        description={
          filter === 'pending'
            ? 'Active tests awaiting processing'
            : 'Test results and values'
        }
        action={
          filter === 'pending' ? (
            <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
              <Plus className="h-4 w-4" />
              Enter Results
            </button>
          ) : undefined
        }
      />

      <FlashBanner />

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilterAndUrl('pending')}
          className={cn(
            'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            filter === 'pending'
              ? 'border-primary bg-primary text-white'
              : 'border-muted-border bg-white text-slate-700 hover:bg-muted-bg',
          )}
        >
          Pending work
        </button>
        <button
          type="button"
          onClick={() => setFilterAndUrl('all')}
          className={cn(
            'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            filter === 'all'
              ? 'border-primary bg-primary text-white'
              : 'border-muted-border bg-white text-slate-700 hover:bg-muted-bg',
          )}
        >
          All results
        </button>
      </div>

      <div className="lims-card overflow-hidden">
        <div className="flex justify-end border-b border-muted-border px-4 py-3">
          <button
            type="button"
            onClick={() =>
              downloadTableCsv('results', [
                { header: 'Result ID', exportValue: (r) => r.id },
                { header: 'Test', exportValue: (r) => r.testName },
                { header: 'Sample', exportValue: (r) => r.sampleId },
                { header: 'Order', exportValue: (r) => r.orderId },
                { header: 'Value', exportValue: (r) => (r.unit ? `${r.value} ${r.unit}` : r.value) },
                { header: 'Reference', exportValue: (r) => r.referenceRange ?? '' },
                { header: 'Critical', exportValue: (r) => (r.isCritical ? 'Yes' : 'No') },
                { header: 'Queue', exportValue: (r) => r.queueStatus },
                { header: 'Approval', exportValue: (r) => r.approvalStatus },
                { header: 'Entered', exportValue: (r) => (r.enteredAt ? formatDateTime(r.enteredAt) : '') },
              ], displayed)
            }
            disabled={!displayed.length}
            className="lims-btn-secondary h-9 px-3 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="lims-table">
            <thead>
              <tr>
                <th>Result ID</th>
                <th>Test</th>
                <th>Sample</th>
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
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted">
                    {filter === 'pending'
                      ? 'No items in queue — all tests completed.'
                      : 'No results found.'}
                  </td>
                </tr>
              ) : (
                displayed.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs">{r.id}</td>
                    <td className="font-medium text-slate-900">{r.testName}</td>
                    <td className="font-mono text-xs">{r.sampleId}</td>
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
            refresh();
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
