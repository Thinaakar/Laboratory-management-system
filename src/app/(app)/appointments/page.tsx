'use client';

import { ArrowLeft, CalendarPlus, ClipboardList } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppointmentDetailModal } from '@/components/lims/appointments/appointment-detail-modal';
import { EditAppointmentModal } from '@/components/lims/appointments/edit-appointment-modal';
import { ScheduleBookingModal } from '@/components/lims/appointments/schedule-booking-modal';
import { DataTable } from '@/components/lims/data-table';
import { ModuleHub } from '@/components/lims/module-hub';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { TableRowActions } from '@/components/lims/table-row-actions';
import { defaultStringSort, useDataTable } from '@/hooks/use-data-table';
import { deleteAppointment, getAppointments } from '@/lib/data/appointments-store';
import type { Appointment } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

type AppointmentsView = 'hub' | 'list';

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<AppointmentsView>('hub');
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewAppointment, setViewAppointment] = useState<Appointment | null>(null);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = useCallback(() => setBookings(getAppointments()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get('schedule') === '1') {
      setShowModal(true);
      window.history.replaceState(null, '', '/appointments');
    }
  }, [searchParams]);

  const handleDelete = useCallback(
    (b: Appointment) => {
      if (!window.confirm(`Delete appointment ${b.id} for ${b.patientName}? This cannot be undone.`)) return;
      try {
        deleteAppointment(b.id);
        refresh();
        setSuccessMessage(`Appointment ${b.id} deleted.`);
      } catch {
        window.alert('Could not delete appointment.');
      }
    },
    [refresh],
  );

  const rowActions = useCallback(
    (b: Appointment) => (
      <TableRowActions
        onView={() => setViewAppointment(b)}
        onEdit={() => setEditAppointment(b)}
        onDelete={() => handleDelete(b)}
        viewLabel={`View appointment ${b.id}`}
        editLabel={`Edit appointment ${b.id}`}
        deleteLabel={`Delete appointment ${b.id}`}
      />
    ),
    [handleDelete],
  );

  const searchFilter = useCallback((b: Appointment, q: string) => {
    return (
      b.patientName.toLowerCase().includes(q) ||
      b.patientId.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.orderId?.toLowerCase().includes(q) ||
      b.testNames?.some((t) => t.toLowerCase().includes(q)) ||
      b.status.toLowerCase().includes(q)
    );
  }, []);

  const sortFn = useCallback((a: Appointment, b: Appointment, key: string, dir: 'asc' | 'desc') => {
    const accessor = (apt: Appointment, k: string) => {
      switch (k) {
        case 'patient':
          return apt.patientName;
        case 'scheduled':
          return apt.scheduledAt;
        case 'type':
          return apt.type;
        case 'status':
          return apt.status;
        default:
          return '';
      }
    };
    return defaultStringSort(a, b, key, dir, accessor);
  }, []);

  const table = useDataTable({ data: bookings, searchQuery: search, searchFilter, sortFn, pageSize: 10 });

  const columns = useMemo(
    () => [
      { key: 'patient', header: 'Patient', sortable: true, className: 'font-medium text-slate-900', render: (b: Appointment) => b.patientName },
      { key: 'scheduled', header: 'Scheduled', sortable: true, className: 'text-slate-600', render: (b: Appointment) => formatDateTime(b.scheduledAt) },
      { key: 'type', header: 'Type', sortable: true, render: (b: Appointment) => b.type },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (b: Appointment) => <StatusBadge label={b.status} variant={statusVariant(b.status)} />,
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
          eyebrow="Scheduling"
          title="Appointments"
          description="Schedule patient visits, book lab orders, and manage upcoming appointments."
          actions={[
            {
              id: 'schedule',
              label: 'Schedule Appointment',
              description: 'Book a patient visit, select tests, and create a lab order.',
              icon: CalendarPlus,
              ctaLabel: 'Schedule Appointment',
              onSelect: () => setShowModal(true),
            },
            {
              id: 'list',
              label: 'Appointment List',
              description: 'View scheduled bookings, priorities, and order details.',
              icon: ClipboardList,
              ctaLabel: 'View Appointments',
              variant: 'secondary',
              onSelect: () => setView('list'),
            },
          ]}
          activityTitle="Recent Appointments"
          activitySubtitle="Latest scheduled bookings in your laboratory"
          activityEmptyMessage="No bookings found. Schedule an appointment to get started."
          items={bookings}
          rowKey={(b) => b.id}
          sortDate={(b) => b.scheduledAt}
          onViewAll={() => setView('list')}
          renderRowActions={rowActions}
          columns={[
            { key: 'patient', header: 'Patient', className: 'font-medium text-slate-900', render: (b) => b.patientName },
            { key: 'scheduled', header: 'Scheduled', className: 'text-slate-600', render: (b) => formatDateTime(b.scheduledAt) },
            { key: 'type', header: 'Type', className: 'text-slate-600', render: (b) => b.type },
            {
              key: 'status',
              header: 'Status',
              render: (b) => <StatusBadge label={b.status} variant={statusVariant(b.status)} />,
            },
          ]}
        />
      )}

      {view === 'list' && (
        <>
          <PageHeader
            title="Appointment List"
            description="Browse appointments — use icons to view, edit, or delete"
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
            rowKey={(b) => b.id}
            emptyMessage={bookings.length === 0 ? 'No bookings found.' : 'No bookings match your search.'}
            search={{ value: search, onChange: setSearch, placeholder: 'Search by patient, booking ID, order, or test…' }}
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
        </>
      )}

      {showModal && (
        <ScheduleBookingModal
          onClose={() => setShowModal(false)}
          onSaved={({ invoice }) => {
            refresh();
            setShowModal(false);
            router.push(`/billing?collect=1&invoiceId=${encodeURIComponent(invoice.id)}`);
          }}
        />
      )}
      {viewAppointment && (
        <AppointmentDetailModal appointment={viewAppointment} onClose={() => setViewAppointment(null)} />
      )}
      {editAppointment && (
        <EditAppointmentModal
          appointment={editAppointment}
          onClose={() => setEditAppointment(null)}
          onSaved={(updated) => {
            refresh();
            setEditAppointment(null);
            setSuccessMessage(`Appointment ${updated.id} updated successfully.`);
          }}
        />
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={null}>
      <AppointmentsContent />
    </Suspense>
  );
}
