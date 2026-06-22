'use client';

import { ArrowLeft, ClipboardList, TestTube2 } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/lims/data-table';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { ModuleHub } from '@/components/lims/module-hub';
import { EditSampleModal } from '@/components/lims/samples/edit-sample-modal';
import { RegisterSampleModal } from '@/components/lims/samples/register-sample-modal';
import { SampleDetailModal } from '@/components/lims/samples/sample-detail-modal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { TableRowActions } from '@/components/lims/table-row-actions';
import { defaultStringSort, useDataTable } from '@/hooks/use-data-table';
import { getLimsData } from '@/lib/api/use-lims-data';
import type { Sample } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

type SamplesView = 'hub' | 'directory';

function SamplesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<SamplesView>('hub');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [viewSample, setViewSample] = useState<Sample | null>(null);
  const [editSample, setEditSample] = useState<Sample | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = useCallback(async () => {
    const api = await getLimsData();
    setSamples(await api.samples.list());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setShowRegisterModal(true);
      window.history.replaceState(null, '', '/samples');
    }
  }, [searchParams]);

  const handleDelete = useCallback(
    async (s: Sample) => {
      if (!window.confirm(`Delete sample ${s.barcode} (${s.id})? This cannot be undone.`)) return;
      try {
        const api = await getLimsData();
        await api.samples.remove(s.id);
        await refresh();
        setSuccessMessage(`Sample ${s.id} deleted.`);
      } catch {
        window.alert('Could not delete sample.');
      }
    },
    [refresh],
  );

  const rowActions = useCallback(
    (s: Sample) => (
      <TableRowActions
        onView={() => setViewSample(s)}
        onEdit={() => setEditSample(s)}
        onDelete={() => handleDelete(s)}
        viewLabel={`View sample ${s.barcode}`}
        editLabel={`Edit sample ${s.barcode}`}
        deleteLabel={`Delete sample ${s.barcode}`}
      />
    ),
    [handleDelete],
  );

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
        case 'type':
          return s.sampleType;
        case 'status':
          return s.status;
        default:
          return '';
      }
    };
    return defaultStringSort(a, b, key, dir, accessor);
  }, []);

  const table = useDataTable({ data: samples, searchQuery: search, searchFilter, sortFn, pageSize: 10 });

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'Sample ID',
        sortable: true,
        className: 'font-mono text-xs text-slate-600',
        render: (s: Sample) => s.id,
        exportValue: (s: Sample) => s.id,
      },
      {
        key: 'barcode',
        header: 'Barcode',
        sortable: true,
        className: 'font-mono text-xs font-semibold text-slate-900',
        render: (s: Sample) => s.barcode,
        exportValue: (s: Sample) => s.barcode,
      },
      {
        key: 'patient',
        header: 'Patient',
        sortable: true,
        className: 'font-medium text-slate-900',
        render: (s: Sample) => s.patientName,
        exportValue: (s: Sample) => s.patientName,
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (s: Sample) => s.sampleType,
        exportValue: (s: Sample) => s.sampleType,
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        exportValue: (s: Sample) => s.status,
        render: (s: Sample) => <StatusBadge label={s.status} variant={statusVariant(s.status)} />,
      },
      { key: 'actions', header: '', className: 'w-28', render: rowActions },
    ],
    [rowActions],
  );

  return (
    <div className="patients-module">
      <FlashBanner />
      {successMessage && (
        <div className="mb-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {view === 'hub' && (
        <ModuleHub
          eyebrow="Sample Management"
          title="Samples"
          description="Register and track laboratory samples. Collect new specimens or browse the full sample directory."
          actions={[
            {
              id: 'register',
              label: 'Register Sample',
              description:
                'Collect and register a new sample with barcode tracking for lab processing.',
              icon: TestTube2,
              ctaLabel: 'Register Sample',
              onSelect: () => setShowRegisterModal(true),
            },
            {
              id: 'directory',
              label: 'Sample Directory',
              description: 'Browse, search, and review all registered samples and their statuses.',
              icon: ClipboardList,
              ctaLabel: 'View Directory',
              variant: 'secondary',
              onSelect: () => setView('directory'),
            },
          ]}
          activityTitle="Recent Sample Activity"
          activitySubtitle="Latest samples registered in your laboratory"
          activityEmptyMessage="No samples registered yet. Register your first sample to get started."
          items={samples}
          rowKey={(s) => s.id}
          sortDate={(s) => s.createdAt}
          onViewAll={() => setView('directory')}
          renderRowActions={rowActions}
          columns={[
            {
              key: 'patient',
              header: 'Patient',
              className: 'font-medium text-slate-900',
              render: (s) => s.patientName,
            },
            {
              key: 'barcode',
              header: 'Barcode',
              className: 'font-mono text-xs font-semibold text-slate-900',
              render: (s) => s.barcode,
            },
            {
              key: 'type',
              header: 'Type',
              render: (s) => s.sampleType,
            },
            {
              key: 'status',
              header: 'Status',
              render: (s) => <StatusBadge label={s.status} variant={statusVariant(s.status)} />,
            },
            {
              key: 'collected',
              header: 'Collected',
              className: 'text-slate-600',
              render: (s) => (s.collectedAt ? formatDateTime(s.collectedAt) : '—'),
            },
          ]}
        />
      )}

      {view === 'directory' && (
        <>
          <PageHeader
            title="Sample Directory"
            description="Browse samples — use icons to view, edit, or delete"
            action={
              <button type="button" onClick={() => setView('hub')} className="lims-btn-secondary">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            }
          />
          <DataTable
            columns={columns}
            data={table.rows}
            rowKey={(s) => s.id}
            emptyMessage={samples.length === 0 ? 'No samples found.' : 'No samples match your search.'}
            search={{
              value: search,
              onChange: setSearch,
              placeholder: 'Search by ID, barcode, patient, or order…',
            }}
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
            download={{ filename: 'samples', data: table.allRows }}
          />
        </>
      )}

      {showRegisterModal && (
        <RegisterSampleModal
          onClose={() => setShowRegisterModal(false)}
          onSaved={(sample) => {
            refresh();
            setShowRegisterModal(false);
            setView('directory');
            setSuccessMessage(`Sample ${sample.barcode} registered successfully.`);
            router.push('/results?filter=pending&success=sample');
          }}
        />
      )}

      {editSample && (
        <EditSampleModal
          sample={editSample}
          onClose={() => setEditSample(null)}
          onSaved={(sample) => {
            refresh();
            setEditSample(null);
            setSuccessMessage(`Sample ${sample.barcode} updated successfully.`);
          }}
        />
      )}

      {viewSample && <SampleDetailModal sample={viewSample} onClose={() => setViewSample(null)} />}
    </div>
  );
}

export default function SamplesPage() {
  return (
    <Suspense fallback={null}>
      <SamplesContent />
    </Suspense>
  );
}
