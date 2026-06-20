'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { getLimsData } from '@/lib/api/use-lims-data';
import type { Invoice } from '@/lib/types/lims';
import { formatCurrency } from '@/lib/utils';

interface CollectPaymentModalProps {
  onClose: () => void;
  onSaved: () => void;
  initialInvoiceId?: string;
}

export function CollectPaymentModal({
  onClose,
  onSaved,
  initialInvoiceId,
}: CollectPaymentModalProps) {
  const [ready, setReady] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const api = await getLimsData();
      const all = await api.invoices.list();
      const pending = all.filter((i) => i.status !== 'Paid');
      const defaultId =
        initialInvoiceId && pending.some((i) => i.id === initialInvoiceId)
          ? initialInvoiceId
          : pending[0]?.id ?? '';
      const selected = pending.find((i) => i.id === defaultId);
      if (!active) return;
      setInvoices(pending);
      setInvoiceId(defaultId);
      setAmount(selected ? String(selected.amount - selected.paidAmount) : '');
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [initialInvoiceId]);

  const selectedInvoice = useMemo(
    () => invoices.find((inv) => inv.id === invoiceId),
    [invoices, invoiceId],
  );

  const dueAmount = selectedInvoice ? selectedInvoice.amount - selectedInvoice.paidAmount : 0;

  const handleInvoiceChange = (nextId: string) => {
    setInvoiceId(nextId);
    const inv = invoices.find((i) => i.id === nextId);
    setAmount(inv ? String(inv.amount - inv.paidAmount) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedInvoice) {
      setError('Select an invoice.');
      return;
    }
    const paymentAmount = Number(amount);
    if (!amount.trim() || Number.isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }

    setSaving(true);
    try {
      const api = await getLimsData();
      await api.invoices.recordPayment(selectedInvoice.id, {
        amount: paymentAmount,
        paymentMethod: method,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden sm:max-h-[min(92vh,calc(100vh-3rem))]">
            <div className="flex shrink-0 items-start justify-between border-b border-muted-border px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Collect Payment</h3>
                <p className="mt-1 text-sm text-muted">Select an invoice and record the payment received</p>
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
                {error && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                {!ready ? (
                  <p className="text-sm text-muted">Loading invoices…</p>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted">
                        Invoice <span className="text-error">*</span>
                      </label>
                      <select
                        className="lims-input"
                        name="invoiceId"
                        required
                        value={invoiceId}
                        onChange={(e) => handleInvoiceChange(e.target.value)}
                        disabled={invoices.length === 0}
                      >
                        {invoices.length === 0 ? (
                          <option value="">No pending invoices</option>
                        ) : (
                          invoices.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.id} — {inv.patientName}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">Invoice Amount</label>
                        <input
                          className="lims-input cursor-not-allowed bg-muted-bg text-slate-700"
                          value={selectedInvoice ? formatCurrency(selectedInvoice.amount) : '—'}
                          readOnly
                          tabIndex={-1}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">Paid Amount</label>
                        <input
                          className="lims-input cursor-not-allowed bg-muted-bg text-slate-700"
                          value={selectedInvoice ? formatCurrency(selectedInvoice.paidAmount) : '—'}
                          readOnly
                          tabIndex={-1}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">Due Amount</label>
                        <input
                          className="lims-input cursor-not-allowed bg-muted-bg font-medium text-slate-900"
                          value={selectedInvoice ? formatCurrency(dueAmount) : '—'}
                          readOnly
                          tabIndex={-1}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">
                          Amount <span className="text-error">*</span>
                        </label>
                        <input
                          className="lims-input"
                          type="number"
                          name="amount"
                          min={0}
                          step={1}
                          required
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          disabled={!selectedInvoice}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">
                          Payment Method <span className="text-error">*</span>
                        </label>
                        <select
                          className="lims-input"
                          name="method"
                          required
                          value={method}
                          onChange={(e) => setMethod(e.target.value as typeof method)}
                          disabled={!selectedInvoice}
                        >
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="Card">Card</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-muted-border bg-white px-6 py-4">
                <button type="button" onClick={onClose} className="lims-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="lims-btn-primary" disabled={!ready || !selectedInvoice || saving}>
                  {saving ? 'Saving…' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
