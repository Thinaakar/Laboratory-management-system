'use client';

import { ArrowLeft, ClipboardList, UserPlus } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/lims/data-table';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { ModuleHub } from '@/components/lims/module-hub';
import { PatientDetailModal } from '@/components/lims/patients/patient-detail-modal';
import { PatientRegistrationModal } from '@/components/lims/patients/patient-registration-modal';
import { StatusBadge } from '@/components/lims/status-badge';
import { TableRowActions } from '@/components/lims/table-row-actions';
import { defaultStringSort, useDataTable } from '@/hooks/use-data-table';
import { getLimsData } from '@/lib/api/use-lims-data';
import type { Patient } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

type PatientsView = 'hub' | 'directory';

function patientTypeVariant(type?: string): 'neutral' | 'primary' | 'warning' | 'success' {
  switch (type) {
    case 'Scheduled':
    case 'Corporate':
      return 'primary';
    case 'Insurance':
      return 'warning';
    case 'Camp':
      return 'success';
    default:
      return 'neutral';
  }
}

function PatientsContent() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<PatientsView>('hub');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = useCallback(async () => {
    const api = await getLimsData();
    setPatients(await api.patients.list());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setShowRegisterModal(true);
      window.history.replaceState(null, '', '/patients');
    }
  }, [searchParams]);

  const handleDelete = useCallback(
    async (p: Patient) => {
      if (!window.confirm(`Delete patient ${p.name} (${p.id})? This cannot be undone.`)) return;
      try {
        const api = await getLimsData();
        await api.patients.remove(p.id);
        await refresh();
        setSuccessMessage(`Patient ${p.id} deleted.`);
      } catch {
        window.alert('Could not delete patient.');
      }
    },
    [refresh],
  );

  const rowActions = useCallback(
    (p: Patient) => (
      <TableRowActions
        onView={() => setViewPatient(p)}
        onEdit={() => setEditPatient(p)}
        onDelete={() => handleDelete(p)}
        viewLabel={`View ${p.name}`}
        editLabel={`Edit ${p.name}`}
        deleteLabel={`Delete ${p.name}`}
      />
    ),
    [handleDelete],
  );

  const searchFilter = useCallback((p: Patient, q: string) => {
    return (
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.bloodGroup?.toLowerCase().includes(q) ?? false)
    );
  }, []);

  const sortFn = useCallback((a: Patient, b: Patient, key: string, dir: 'asc' | 'desc') => {
    const accessor = (p: Patient, k: string) => {
      switch (k) {
        case 'id':
          return p.id;
        case 'name':
          return p.name;
        case 'phone':
          return p.phone;
        case 'type':
          return p.patientType ?? '';
        default:
          return '';
      }
    };
    return defaultStringSort(a, b, key, dir, accessor);
  }, []);

  const table = useDataTable({ data: patients, searchQuery: search, searchFilter, sortFn, pageSize: 10 });

  const columns = useMemo(
    () => [
      { key: 'id', header: 'Patient ID', sortable: true, className: 'font-mono text-xs text-slate-600', render: (p: Patient) => p.id, exportValue: (p: Patient) => p.id },
      { key: 'name', header: 'Name', sortable: true, className: 'font-medium text-slate-900', render: (p: Patient) => p.name, exportValue: (p: Patient) => p.name },
      { key: 'phone', header: 'Phone', sortable: true, render: (p: Patient) => p.phone, exportValue: (p: Patient) => p.phone },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        exportValue: (p: Patient) => p.patientType ?? '',
        render: (p: Patient) =>
          p.patientType ? <StatusBadge label={p.patientType} variant={patientTypeVariant(p.patientType)} /> : '—',
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
          eyebrow="Patient Management"
          title="Patients"
          description="Manage patient registrations and records. Register new patients or browse the full directory."
          actions={[
            {
              id: 'register',
              label: 'Register Patient',
              description: 'Add a new patient to the laboratory registry with demographics, contact details, and referral information.',
              icon: UserPlus,
              ctaLabel: 'Register Patient',
              onSelect: () => setShowRegisterModal(true),
            },
            {
              id: 'directory',
              label: 'Patient Directory',
              description: 'Browse, search, and review all registered patients.',
              icon: ClipboardList,
              ctaLabel: 'View Directory',
              variant: 'secondary',
              onSelect: () => setView('directory'),
            },
          ]}
          activityTitle="Recent Patient Activity"
          activitySubtitle="Latest registrations in your laboratory"
          activityEmptyMessage="No patients registered yet. Register your first patient to get started."
          items={patients}
          rowKey={(p) => p.id}
          sortDate={(p) => p.createdAt}
          onViewAll={() => setView('directory')}
          renderRowActions={rowActions}
          columns={[
            { key: 'name', header: 'Patient', className: 'font-medium text-slate-900', render: (p) => p.name },
            { key: 'id', header: 'ID', className: 'font-mono text-xs text-slate-600', render: (p) => p.id },
            {
              key: 'type',
              header: 'Type',
              render: (p) =>
                p.patientType ? <StatusBadge label={p.patientType} variant={patientTypeVariant(p.patientType)} /> : '—',
            },
            { key: 'phone', header: 'Phone', className: 'text-slate-600', render: (p) => p.phone },
            { key: 'registered', header: 'Registered', className: 'text-slate-600', render: (p) => formatDateTime(p.createdAt) },
          ]}
        />
      )}

      {view === 'directory' && (
        <>
          <PageHeader
            title="Patient Directory"
            description="Browse patients — use icons to view, edit, or delete"
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
            rowKey={(p) => p.id}
            emptyMessage={patients.length === 0 ? 'No patients found.' : 'No patients match your search.'}
            search={{ value: search, onChange: setSearch, placeholder: 'Search by name, ID, or phone…' }}
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
            download={{ filename: 'patients', data: table.allRows }}
          />
        </>
      )}

      {showRegisterModal && (
        <PatientRegistrationModal
          onClose={() => setShowRegisterModal(false)}
          onSaved={(patient) => {
            refresh();
            setShowRegisterModal(false);
            setView('directory');
            setSuccessMessage(`Patient ${patient.id} registered successfully.`);
          }}
        />
      )}
      {editPatient && (
        <PatientRegistrationModal
          patient={editPatient}
          onClose={() => setEditPatient(null)}
          onSaved={(patient) => {
            refresh();
            setEditPatient(null);
            setSuccessMessage(`Patient ${patient.id} updated successfully.`);
          }}
        />
      )}
      {viewPatient && <PatientDetailModal patient={viewPatient} onClose={() => setViewPatient(null)} />}
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={null}>
      <PatientsContent />
    </Suspense>
  );
}
