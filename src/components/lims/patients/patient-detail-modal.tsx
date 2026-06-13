'use client';

import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { StatusBadge } from '@/components/lims/status-badge';
import type { Patient } from '@/lib/types/lims';
import { formatDate, formatDateTime } from '@/lib/utils';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
}

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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function PatientDetailModal({ patient, onClose }: PatientDetailModalProps) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex w-full max-w-lg flex-col overflow-hidden">
            <div className="lims-dialog-header">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Patient Details</h3>
                <p className="mt-0.5 font-mono text-sm text-muted">{patient.id}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-muted transition-colors hover:bg-muted-bg hover:text-slate-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="lims-dialog-body space-y-4">
              <DetailRow label="Name" value={patient.name} />
              <DetailRow label="Phone" value={patient.phone} />
              <DetailRow label="Blood Group" value={patient.bloodGroup ?? '—'} />
              <DetailRow label="Gender" value={patient.gender} />
              <DetailRow label="Date of Birth" value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '—'} />
              <DetailRow label="Age" value={patient.age ?? '—'} />
              <DetailRow label="Address" value={patient.address ?? '—'} />
              <DetailRow label="Referred Doctor" value={patient.referredDoctor ?? '—'} />
              <DetailRow
                label="Patient Type"
                value={
                  patient.patientType ? (
                    <StatusBadge label={patient.patientType} variant={patientTypeVariant(patient.patientType)} />
                  ) : (
                    '—'
                  )
                }
              />
              <DetailRow label="Registered" value={formatDateTime(patient.createdAt)} />
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
