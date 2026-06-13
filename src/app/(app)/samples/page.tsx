'use client';

import { ArrowLeft, ClipboardList, TestTube2 } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/lims/data-table';
import { ModuleActionHub } from '@/components/lims/module-action-hub';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { RegisterSampleModal } from '@/components/lims/samples/register-sample-modal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { defaultStringSort, useDataTable } from '@/hooks/use-data-table';
import { getSamples } from '@/lib/data/store';
import type { Sample } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

type SamplesView = 'hub' | 'list';

function SamplesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<SamplesView>('hub');
  const [showModal, setShowModal] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setSamples(getSamples());
  }, []);

  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setShowModal(true);
      window.history.replaceState(null, '', '/samples');
    }
  }, [searchParams]);

  const filteredData = useMemo(() => {
    return samples.filter((s) => statusFilter === 'all' || s.status === statusFilter);
  }, [samples, statusFilter]);

  const searchFilter = useCallback((s: Sample, q: string) => {
    return (
      s.id.toLowerCase().includes(q) ||
      s.barcode.toLowerCase().includes(q) ||
      s.patientName.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.sampleType.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q)
    );
  }, []);

  const sortFn = useCallback((a: Sample, b: Sample, key: string, dir: 'asc' | 'desc') => {
    const accessor = (s: Sample, k: string) => {
      switch (k) {
        case 'id':
          return s.id;
        case 'barcode':
          return s.barcode;
        case 'patient':
          return s.patientName;
        case 'order':
          return s.orderId;
        case 'type':
          return s.sampleType;
        case 'status':
          return s.status;
        case 'collected':
          return s.collectedAt ?? '';
        case 'received':
          return s.receivedAt ?? '';
        default:
          return '';
      }
    };
    return defaultStringSort(a, b, key, dir, accessor);
  }, []);

  const table = useDataTable({
    data: filteredData,
    searchQuery: search,
    searchFilter,
    sortFn,
    pageSize: 10,
  });

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'Sample ID',
        sortable: true,
        className: 'font-mono text-xs text-slate-600',
        render: (s: Sample) => s.id,
      },
      {
        key: 'barcode',
        header: 'Barcode',
        sortable: true,
        className: 'font-mono text-xs font-semibold text-slate-900',
        render: (s: Sample) => s.barcode,
      },
      {
        key: 'patient',
        header: 'Patient',
        sortable: true,
        className: 'font-medium text-slate-900',
        render: (s: Sample) => s.patientName,
      },
      {
        key: 'order',
        header: 'Order',
        sortable: true,
        className: 'font-mono text-xs text-slate-600',
        render: (s: Sample) => s.orderId,
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (s: Sample) => s.sampleType,
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (s: Sample) => <StatusBadge label={s.status} variant={statusVariant(s.status)} />,
      },
      {
        key: 'collected',
        header: 'Collected',
        sortable: true,
        render: (s: Sample) => (s.collectedAt ? formatDateTime(s.collectedAt) : '—'),
      },
      {
        key: 'received',
        header: 'Received',
        sortable: true,
        render: (s: Sample) => (s.receivedAt ? formatDateTime(s.receivedAt) : '—'),
      },
    ],
    [],
  );

  const statusOptions = useMemo(() => {
    return [...new Set(samples.map((s) => s.status))].sort();
  }, [samples]);

  return (
    <>
      <PageHeader
        title="Samples"
        description="Sample registration and tracking"
        action={
          view !== 'hub' ? (
            <button type="button" onClick={() => setView('hub')} className="lims-btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : undefined
        }
      />

      <FlashBanner />

      {view === 'hub' && (
        <ModuleActionHub
          actions={[
            {
              id: 'register',
              label: 'Register Sample',
              description: 'Collect and register a new sample with barcode tracking for lab processing.',
              icon: TestTube2,
              onSelect: () => setShowModal(true),
            },
            {
              id: 'list',
              label: 'Sample List',
              description: 'View all registered samples, statuses, and collection timestamps.',
              icon: ClipboardList,
              onSelect: () => setView('list'),
            },
          ]}
        />
      )}

      {view === 'list' && (
        <DataTable
          columns={columns}
          data={table.rows}
          rowKey={(s) => s.id}
          emptyMessage={
            samples.length === 0 ? 'No samples registered yet.' : 'No samples match your filters.'
          }
          search={{
            value: search,
            onChange: setSearch,
            placeholder: 'Search by ID, barcode, patient, or order…',
          }}
          filters={
            <select
              className="lims-input h-9 w-auto min-w-[8rem] text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          }
          sortKey={table.sortKey}
          sortDir={table.sortDir}
          onSort={table.toggleSort}
          pagination={{
            page: table.page,
            pageSize: table.pageSize,
            totalItems: table.totalItems,
            totalPages: table.totalPages,
            onPageChange: table.setPage,
            onPageSizeChange: table.setPageSize,
          }}
        />
      )}

      {showModal && (
        <RegisterSampleModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            setSamples(getSamples());
            router.push('/results?filter=pending&success=sample');
          }}
        />
      )}
    </>
  );
}

export default function SamplesPage() {
  return (
    <Suspense fallback={null}>
      <SamplesContent />
    </Suspense>
  );
}
