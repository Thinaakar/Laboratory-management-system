'use client';

import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import type { Sample } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

interface SampleDetailModalProps {
  sample: Sample;
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

export function SampleDetailModal({ sample, onClose }: SampleDetailModalProps) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex w-full max-w-lg flex-col overflow-hidden">
            <div className="lims-dialog-header">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Sample Details</h3>
                <p className="mt-0.5 font-mono text-sm text-muted">{sample.id}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-muted-bg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="lims-dialog-body space-y-4">
              <DetailRow label="Barcode" value={<span className="font-mono font-semibold">{sample.barcode}</span>} />
              <DetailRow label="Patient" value={sample.patientName} />
              <DetailRow label="Patient ID" value={<span className="font-mono text-xs">{sample.patientId}</span>} />
              <DetailRow label="Order" value={<span className="font-mono text-xs">{sample.orderId}</span>} />
              <DetailRow label="Sample Type" value={sample.sampleType} />
              <DetailRow
                label="Status"
                value={<StatusBadge label={sample.status} variant={statusVariant(sample.status)} />}
              />
              <DetailRow label="Collected" value={sample.collectedAt ? formatDateTime(sample.collectedAt) : '—'} />
              <DetailRow label="Received" value={sample.receivedAt ? formatDateTime(sample.receivedAt) : '—'} />
              <DetailRow label="Registered" value={formatDateTime(sample.createdAt)} />
              <DetailRow label="Rejection Reason" value={sample.rejectionReason ?? '—'} />
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
