'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getInvoices } from '@/lib/data/store';
import { formatCurrency, formatDateTime } from '@/lib/utils';

function BillingContent() {
  const invoices = getInvoices();

  return (
    <>
      <FlashBanner />
      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Order</th>
              <th>Patient</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Method</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-mono text-xs">{inv.id}</td>
                <td className="font-mono text-xs">{inv.orderId}</td>
                <td className="font-medium text-slate-900">{inv.patientName}</td>
                <td>{formatCurrency(inv.amount)}</td>
                <td>{formatCurrency(inv.paidAmount)}</td>
                <td>{inv.paymentMethod ?? '—'}</td>
                <td>
                  <StatusBadge label={inv.status} variant={statusVariant(inv.status)} />
                </td>
                <td>{formatDateTime(inv.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing"
        description="Invoices and payment tracking"
        action={
          <Link href="/billing/collect" className="lims-btn-primary">
            Collect Payment
          </Link>
        }
      />
      <Suspense fallback={null}>
        <BillingContent />
      </Suspense>
    </div>
  );
}
