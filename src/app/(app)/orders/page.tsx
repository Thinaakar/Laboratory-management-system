'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getLimsData } from '@/lib/api/use-lims-data';
import type { LabOrder } from '@/lib/types/lims';
import { formatCurrency, formatDateTime } from '@/lib/utils';

function OrdersContent() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const api = await getLimsData();
    setOrders(await api.orders.list());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
                <td colSpan={6} className="py-8 text-center text-sm text-muted">
                  Loading orders…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted">
                  No orders yet. Schedule an appointment to create one.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-xs text-slate-600">{order.id}</td>
                  <td className="font-medium text-slate-900">{order.patientName}</td>
                  <td className="max-w-xs truncate text-sm">{order.testNames.join(', ')}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <StatusBadge label={order.status} variant={statusVariant(order.status)} />
                  </td>
                  <td className="text-sm text-muted">{formatDateTime(order.createdAt)}</td>
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
    <PageHeader title="Orders" description="Lab test orders" />
    <Suspense>
      <OrdersContent />
    </Suspense>
  </div>
  );
}
