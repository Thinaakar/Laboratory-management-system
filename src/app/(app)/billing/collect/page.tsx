'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { getInvoices } from '@/lib/data/store';
import type { Invoice } from '@/lib/types/lims';
import { formatCurrency } from '@/lib/utils';

function CollectPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceIdParam = searchParams.get('invoiceId');

  const invoices = useMemo(
    () => getInvoices().filter((i) => i.status !== 'Paid'),
    [],
  );

  const initialInvoiceId = useMemo(() => {
    if (invoiceIdParam && invoices.some((i) => i.id === invoiceIdParam)) {
      return invoiceIdParam;
    }
    return invoices[0]?.id ?? '';
  }, [invoiceIdParam, invoices]);

  const [invoiceId, setInvoiceId] = useState(initialInvoiceId);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');

  const selectedInvoice: Invoice | undefined = useMemo(
    () => invoices.find((inv) => inv.id === invoiceId),
    [invoices, invoiceId],
  );

  const dueAmount = selectedInvoice ? selectedInvoice.amount - selectedInvoice.paidAmount : 0;

  useEffect(() => {
    setInvoiceId(initialInvoiceId);
  }, [initialInvoiceId]);

  useEffect(() => {
    if (selectedInvoice) {
      setAmount(String(dueAmount));
    } else {
      setAmount('');
    }
  }, [selectedInvoice, dueAmount]);

  return (
    <div>
      <PageHeader
        title="Collect Payment"
        description="Record payment against an open invoice"
        action={
          <Link href="/billing" className="lims-btn-secondary">
            Back to billing
          </Link>
        }
      />

      <div className="max-w-xl overflow-hidden rounded-xl border border-muted-border bg-white shadow-card-md">
        <div className="border-b border-muted-border px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Payment Details</h2>
          <p className="mt-1 text-sm text-muted">Select an invoice and record the payment received</p>
        </div>

        <form
          className="space-y-5 px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            router.push('/samples/new?success=payment');
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Invoice <span className="text-error">*</span>
            </label>
            <select
              className="lims-input"
              name="invoiceId"
              required
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
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

          <div className="flex gap-3 border-t border-muted-border pt-4">
            <button type="submit" className="lims-btn-primary" disabled={!selectedInvoice}>
              Record Payment
            </button>
            <Link href="/billing" className="lims-btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CollectPaymentPage() {
  return (
    <Suspense fallback={null}>
      <CollectPaymentContent />
    </Suspense>
  );
}
