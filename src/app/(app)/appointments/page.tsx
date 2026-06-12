'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getAppointments } from '@/lib/data/store';
import { formatDateTime } from '@/lib/utils';

function AppointmentsContent() {
  const appointments = getAppointments();

  return (
    <>
      <FlashBanner />
      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Patient</th>
              <th>Scheduled</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td className="font-mono text-xs">{a.id}</td>
                <td className="font-medium text-slate-900">{a.patientName}</td>
                <td>{formatDateTime(a.scheduledAt)}</td>
                <td>{a.type}</td>
                <td><StatusBadge label={a.status} variant={statusVariant(a.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AppointmentsPage() {
  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Patient visit scheduling"
        action={
          <Link href="/patients/intake" className="lims-btn-primary">
            Schedule Appointment
          </Link>
        }
      />
      <Suspense fallback={null}>
        <AppointmentsContent />
      </Suspense>
    </div>
  );
}
