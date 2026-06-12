'use client';

import { Plus } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CollectPaymentModal } from '@/components/lims/billing/collect-payment-modal';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { HydrationSafeInput } from '@/components/lims/client-only';
import { getInvoices } from '@/lib/data/store';
import type { Invoice } from '@/lib/types/lims';
import { formatCurrency, formatDateTime } from '@/lib/utils';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [initialInvoiceId, setInitialInvoiceId] = useState<string | undefined>();

  const refresh = useCallback(() => {
    setInvoices(getInvoices());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get('collect') === '1') {
      setInitialInvoiceId(searchParams.get('invoiceId') ?? undefined);
      setShowModal(true);
      window.history.replaceState(null, '', '/billing');
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (inv) =>
        inv.id.toLowerCase().includes(q) ||
        inv.orderId.toLowerCase().includes(q) ||
        inv.patientId.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q) ||
        inv.paymentMethod?.toLowerCase().includes(q),
    );
  }, [invoices, search]);

  return (
    <>
      <PageHeader
        title="Billing"
        description="Invoices and payment tracking"
        action={
          <button
            type="button"
            onClick={() => {
              setInitialInvoiceId(undefined);
              setShowModal(true);
            }}
            className="lims-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Collect Payment
          </button>
        }
      />

      <FlashBanner />

      <div className="lims-card overflow-hidden">
        <div className="border-b border-muted-border bg-muted-bg/40 px-5 py-4">
          <HydrationSafeInput
            type="search"
            className="lims-input max-w-sm bg-white"
            placeholder="Search by invoice, order, patient, or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="lims-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Order ID</th>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Method</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-sm text-muted">
                    {invoices.length === 0
                      ? 'No invoices found. Collect payment to get started.'
                      : 'No invoices match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const due = inv.amount - inv.paidAmount;
                  return (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs">{inv.id}</td>
                      <td className="font-mono text-xs">{inv.orderId}</td>
                      <td className="font-medium text-slate-900">{inv.patientName}</td>
                      <td className="font-mono text-xs">{inv.patientId}</td>
                      <td>{formatCurrency(inv.amount)}</td>
                      <td>{formatCurrency(inv.paidAmount)}</td>
                      <td className={due > 0 ? 'font-medium text-slate-900' : ''}>
                        {formatCurrency(due)}
                      </td>
                      <td>{inv.paymentMethod ?? '—'}</td>
                      <td>
                        <StatusBadge label={inv.status} variant={statusVariant(inv.status)} />
                      </td>
                      <td>{formatDateTime(inv.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CollectPaymentModal
          initialInvoiceId={initialInvoiceId}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            refresh();
            setShowModal(false);
            router.push('/samples?register=1&success=payment');
          }}
        />
      )}
    </>
  );
}

export default function BillingPage() {
  return (
    <div>
      <Suspense fallback={null}>
        <BillingContent />
      </Suspense>
    </div>
  );
}
