'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { getLimsData } from '@/lib/api/use-lims-data';
import { getActiveSampleTypes } from '@/lib/data/sample-types-store';

import type { LabOrder, Sample } from '@/lib/types/lims';

interface RegisterSampleModalProps {
  onClose: () => void;
  onSaved: (sample: Sample) => void;
}

function toDatetimeLocalValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function RegisterSampleModal({ onClose, onSaved }: RegisterSampleModalProps) {
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [sampleTypes, setSampleTypes] = useState<ReturnType<typeof getActiveSampleTypes>>([]);
  const [orderId, setOrderId] = useState('');
  const [sampleType, setSampleType] = useState('');
  const [collectedAt, setCollectedAt] = useState('');
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const api = await getLimsData();
      const [list, barcode] = await Promise.all([
        api.orders.list(),
        api.samples.nextBarcode(),
      ]);
      const types = getActiveSampleTypes();
      if (cancelled) return;
      setOrders(list);
      setSampleTypes(types);
      setOrderId(list[0]?.id ?? '');
      setSampleType(types[0]?.name ?? '');
      setCollectedAt(toDatetimeLocalValue());
      setBarcode(barcode.barcode);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !collectedAt) return;
    try {
      const api = await getLimsData();
      const saved = await api.samples.create({ orderId, sampleType, barcode, collectedAt });
      onSaved(saved);
    } catch {
      window.alert('Could not register sample.');
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden sm:max-h-[min(92vh,calc(100vh-3rem))]">
            <div className="flex shrink-0 items-start justify-between border-b border-muted-border px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Register Sample</h3>
                <p className="mt-1 text-sm text-muted">Create sample record and generate barcode</p>
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

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" suppressHydrationWarning>
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
                {!ready ? (
                  <p className="text-sm text-muted">Loading orders…</p>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted">
                        Order <span className="text-error">*</span>
                      </label>
                      <select
                        className="lims-input"
                        name="orderId"
                        required
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        disabled={orders.length === 0}
                      >
                        {orders.length === 0 ? (
                          <option value="">No orders available</option>
                        ) : (
                          orders.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.id} — {o.patientName}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted">
                        Sample Type <span className="text-error">*</span>
                      </label>
                      <select
                        className="lims-input"
                        name="sampleType"
                        required
                        value={sampleType}
                        onChange={(e) => setSampleType(e.target.value)}
                        disabled={sampleTypes.length === 0}
                      >
                        {sampleTypes.length === 0 ? (
                          <option value="">No sample types configured</option>
                        ) : (
                          sampleTypes.map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted">
                        Collection Date &amp; Time <span className="text-error">*</span>
                      </label>
                      <input
                        className="lims-input"
                        type="datetime-local"
                        name="collectedAt"
                        value={collectedAt}
                        onChange={(e) => setCollectedAt(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted">
                        Barcode <span className="text-error">*</span>
                      </label>
                      <input
                        className="lims-input pointer-events-none cursor-not-allowed bg-muted-bg font-mono text-slate-700"
                        name="barcode"
                        value={barcode}
                        readOnly
                        tabIndex={-1}
                        aria-readonly="true"
                        aria-describedby="barcode-hint"
                      />
                      <p id="barcode-hint" className="mt-1 text-xs text-muted">
                        Auto-generated and read-only
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-muted-border bg-white px-6 py-4">
                <button type="button" onClick={onClose} className="lims-btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lims-btn-primary"
                  disabled={!ready || orders.length === 0}
                >
                  Register &amp; Collect Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
