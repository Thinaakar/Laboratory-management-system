'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { getLimsData } from '@/lib/api/use-lims-data';
import { getActiveSampleTypes } from '@/lib/data/sample-types-store';
import type { Sample, SampleStatus } from '@/lib/types/lims';

const SAMPLE_STATUS_OPTIONS: SampleStatus[] = [
  'Registered',
  'Collected',
  'Received',
  'Processing',
  'Completed',
  'Rejected',
];

interface EditSampleModalProps {
  sample: Sample;
  onClose: () => void;
  onSaved: (sample: Sample) => void;
}

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditSampleModal({ sample, onClose, onSaved }: EditSampleModalProps) {
  const sampleTypes = getActiveSampleTypes();
  const [sampleType, setSampleType] = useState(sample.sampleType);
  const [status, setStatus] = useState<SampleStatus>(sample.status);
  const [collectedAt, setCollectedAt] = useState(toDatetimeLocalValue(sample.collectedAt));
  const [error, setError] = useState('');

  useEffect(() => {
    setSampleType(sample.sampleType);
    setStatus(sample.status);
    setCollectedAt(toDatetimeLocalValue(sample.collectedAt));
  }, [sample]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex w-full max-w-lg flex-col overflow-hidden">
            <div className="lims-dialog-header">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Edit Sample</h3>
                <p className="mt-0.5 font-mono text-sm text-muted">{sample.barcode}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-muted-bg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form
              className="flex flex-col"
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                try {
                  const api = await getLimsData();
                  const saved = await api.samples.update(sample.id, {
                    sampleType,
                    status,
                    collectedAt: collectedAt || undefined,
                  });
                  onSaved(saved);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not update sample.');
                }
              }}
            >
              <div className="lims-dialog-body space-y-4">
                {error && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Sample type</label>
                  <select className="lims-input" value={sampleType} onChange={(e) => setSampleType(e.target.value)} required>
                    {sampleTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Status</label>
                  <select
                    className="lims-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SampleStatus)}
                    required
                  >
                    {SAMPLE_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Collection date &amp; time</label>
                  <input
                    className="lims-input"
                    type="datetime-local"
                    value={collectedAt}
                    onChange={(e) => setCollectedAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="lims-dialog-footer">
                <button type="button" onClick={onClose} className="lims-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="lims-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
