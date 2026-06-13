'use client';

import { Plus } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/lims/data-table';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { PatientRegistrationModal } from '@/components/lims/patients/patient-registration-modal';
import { defaultStringSort, useDataTable } from '@/hooks/use-data-table';
import { getPatients } from '@/lib/data/patients-store';
import type { Patient } from '@/lib/types/lims';
import { formatDate, formatDateTime } from '@/lib/utils';

function PatientsContent() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = useCallback(() => {
    setPatients(getPatients());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setShowModal(true);
      window.history.replaceState(null, '', '/patients');
    }
  }, [searchParams]);

  const searchFilter = useCallback((p: Patient, q: string) => {
    return (
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.email?.toLowerCase().includes(q) ?? false)
    );
  }, []);

  const sortFn = useCallback(
    (a: Patient, b: Patient, key: string, dir: 'asc' | 'desc') => {
      const accessor = (p: Patient, k: string) => {
        switch (k) {
          case 'id':
            return p.id;
          case 'name':
            return p.name;
          case 'phone':
            return p.phone;
          case 'email':
            return p.email ?? '';
          case 'age':
            return p.age ?? 0;
          case 'dob':
            return p.dateOfBirth ?? '';
          case 'gender':
            return p.gender;
          case 'type':
            return p.patientType ?? '';
          case 'registered':
            return p.createdAt;
          default:
            return '';
        }
      };
      return defaultStringSort(a, b, key, dir, accessor);
    },
    [],
  );

  const table = useDataTable({
    data: patients,
    searchQuery: search,
    searchFilter,
    sortFn,
    pageSize: 10,
  });

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'Patient ID',
        sortable: true,
        className: 'font-mono text-xs text-slate-600',
        render: (p: Patient) => p.id,
      },
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        className: 'font-medium text-slate-900',
        render: (p: Patient) => p.name,
      },
      {
        key: 'phone',
        header: 'Phone',
        sortable: true,
        render: (p: Patient) => p.phone,
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        render: (p: Patient) => p.email ?? '—',
      },
      {
        key: 'age',
        header: 'Age',
        sortable: true,
        render: (p: Patient) => p.age ?? '—',
      },
      {
        key: 'dob',
        header: 'DOB',
        sortable: true,
        render: (p: Patient) => (p.dateOfBirth ? formatDate(p.dateOfBirth) : '—'),
      },
      {
        key: 'gender',
        header: 'Gender',
        sortable: true,
        render: (p: Patient) => p.gender,
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (p: Patient) => p.patientType ?? '—',
      },
      {
        key: 'registered',
        header: 'Registered',
        sortable: true,
        render: (p: Patient) => formatDateTime(p.createdAt),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Patients"
        description="Patient registry and demographics"
        action={
          <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
            <Plus className="h-4 w-4" />
            Register Patient
          </button>
        }
      />

      <FlashBanner />
      {successMessage && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <DataTable
        columns={columns}
        data={table.rows}
        rowKey={(p) => p.id}
        emptyMessage={
          patients.length === 0
            ? 'No patients found. Register a new patient to get started.'
            : 'No patients match your search.'
        }
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search by name, ID, or phone…',
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
      />

      {showModal && (
        <PatientRegistrationModal
          onClose={() => setShowModal(false)}
          onSaved={(patient) => {
            refresh();
            setShowModal(false);
            setSuccessMessage(`Patient ${patient.id} registered successfully.`);
          }}
        />
      )}
    </>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={null}>
      <PatientsContent />
    </Suspense>
  );
}
