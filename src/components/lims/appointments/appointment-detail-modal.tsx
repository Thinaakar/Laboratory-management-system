'use client';

import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import type { Appointment } from '@/lib/types/lims';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function AppointmentDetailModal({ appointment, onClose }: AppointmentDetailModalProps) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex w-full max-w-lg flex-col overflow-hidden">
            <div className="lims-dialog-header">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Appointment Details</h3>
                <p className="mt-0.5 font-mono text-sm text-muted">{appointment.id}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-muted-bg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="lims-dialog-body space-y-4">
              <DetailRow label="Patient" value={appointment.patientName} />
              <DetailRow label="Patient ID" value={<span className="font-mono text-xs">{appointment.patientId}</span>} />
              <DetailRow label="Scheduled" value={formatDateTime(appointment.scheduledAt)} />
              <DetailRow label="Type" value={appointment.type} />
              <DetailRow
                label="Status"
                value={<StatusBadge label={appointment.status} variant={statusVariant(appointment.status)} />}
              />
              <DetailRow label="Priority" value={appointment.priority ?? 'Normal'} />
              <DetailRow label="Referring Doctor" value={appointment.referringDoctor ?? 'None'} />
              <DetailRow label="Health Package" value={appointment.healthPackageName ?? '—'} />
              <DetailRow label="Tests" value={appointment.testNames?.join(', ') ?? '—'} />
              <DetailRow label="Amount" value={appointment.orderTotal != null ? formatCurrency(appointment.orderTotal) : '—'} />
              <DetailRow label="Order ID" value={appointment.orderId ? <span className="font-mono text-xs">{appointment.orderId}</span> : '—'} />
              <DetailRow label="Notes" value={appointment.notes ?? '—'} />
            </div>
            <div className="lims-dialog-footer">
              <button type="button" onClick={onClose} className="lims-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
