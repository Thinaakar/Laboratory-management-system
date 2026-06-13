'use client';

import { ArrowLeft, CalendarPlus, ClipboardList } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ModuleActionHub } from '@/components/lims/module-action-hub';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { ScheduleBookingModal } from '@/components/lims/appointments/schedule-booking-modal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { HydrationSafeInput } from '@/components/lims/client-only';
import { getAppointments } from '@/lib/data/appointments-store';
import type { Appointment } from '@/lib/types/lims';
import { formatCurrency, formatDateTime } from '@/lib/utils';

type AppointmentsView = 'hub' | 'list';

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<AppointmentsView>('hub');
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const refresh = useCallback(() => {
    setBookings(getAppointments());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get('schedule') === '1') {
      setShowModal(true);
      window.history.replaceState(null, '', '/appointments');
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.patientName.toLowerCase().includes(q) ||
        b.patientId.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.orderId?.toLowerCase().includes(q) ||
        b.testNames?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [bookings, search]);

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Patient visit scheduling and lab order bookings"
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
              id: 'schedule',
              label: 'Schedule Appointment',
              description: 'Book a patient visit, select tests, and create a lab order.',
              icon: CalendarPlus,
              onSelect: () => setShowModal(true),
            },
            {
              id: 'list',
              label: 'Appointment List',
              description: 'View scheduled bookings, priorities, and order details.',
              icon: ClipboardList,
              onSelect: () => setView('list'),
            },
          ]}
        />
      )}

      {view === 'list' && (
        <div className="lims-card overflow-hidden">
          <div className="border-b border-muted-border bg-muted-bg/40 px-5 py-4">
            <HydrationSafeInput
              type="search"
              className="lims-input max-w-sm bg-white"
              placeholder="Search by patient, booking ID, order, or test…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="lims-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Scheduled</th>
                  <th>Type</th>
                  <th>Referring Doctor</th>
                  <th>Priority</th>
                  <th>Package</th>
                  <th>Tests</th>
                  <th>Amount</th>
                  <th>Order ID</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-10 text-center text-sm text-muted">
                      No bookings found. Schedule an appointment to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono text-xs">{b.id}</td>
                      <td className="font-medium text-slate-900">{b.patientName}</td>
                      <td className="font-mono text-xs">{b.patientId}</td>
                      <td>{formatDateTime(b.scheduledAt)}</td>
                      <td>{b.type}</td>
                      <td>{b.referringDoctor ?? 'None'}</td>
                      <td>{b.priority ?? 'Normal'}</td>
                      <td>{b.healthPackageName ?? '—'}</td>
                      <td className="max-w-xs truncate">{b.testNames?.join(', ') ?? '—'}</td>
                      <td>{b.orderTotal != null ? formatCurrency(b.orderTotal) : '—'}</td>
                      <td className="font-mono text-xs">{b.orderId ?? '—'}</td>
                      <td className="max-w-[10rem] truncate">{b.notes ?? '—'}</td>
                      <td>
                        <StatusBadge label={b.status} variant={statusVariant(b.status)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
    </>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={null}>
      <AppointmentsContent />
    </Suspense>
  );
}
