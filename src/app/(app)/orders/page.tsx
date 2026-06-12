'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { useClientData } from '@/hooks/use-hydrated';
import { getOrders } from '@/lib/data/store';
import type { LabOrder } from '@/lib/types/lims';
import { formatCurrency, formatDateTime } from '@/lib/utils';

function OrdersContent() {
  const { data: orders, ready } = useClientData(() => getOrders());
  const rows: LabOrder[] = orders ?? [];

  return (
    <>
      <FlashBanner />
      <p className="mb-4 text-sm text-muted">
        Orders follow the workflow:{' '}
        <Link href="/patients" className="text-primary hover:underline">Patient</Link>
        {' '}→ Order →{' '}
        <Link href="/billing" className="text-primary hover:underline">Invoice</Link>
        {' '}→{' '}
        <Link href="/samples" className="text-primary hover:underline">Sample</Link>
        {' '}→{' '}
        <Link href="/results" className="text-primary hover:underline">Results</Link>.
      </p>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Patient</th>
              <th>Tests</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {!ready ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-muted">
                  Loading orders…
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.id}</td>
                  <td>
                    <span className="font-medium text-slate-900">{o.patientName}</span>
                    <span className="ml-1 text-xs text-muted">({o.patientId})</span>
                  </td>
                  <td className="max-w-xs truncate">{o.testNames.join(', ')}</td>
                  <td>{formatCurrency(o.totalAmount)}</td>
                  <td>
                    <StatusBadge label={o.status} variant={statusVariant(o.status)} />
                  </td>
                  <td>{formatDateTime(o.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function OrdersPage() {
  return (
    <div>
      <PageHeader
        title="Orders"
        description="Test orders linked to patients through the lab workflow"
        action={
          <Link href="/appointments?schedule=1" className="lims-btn-primary">
            Schedule Appointment
          </Link>
        }
      />
      <Suspense fallback={null}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
