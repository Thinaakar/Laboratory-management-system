'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getSamples } from '@/lib/data/store';
import { formatDateTime } from '@/lib/utils';

function SamplesContent() {
  const samples = getSamples();

  return (
    <>
      <FlashBanner />
      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Barcode</th>
              <th>Patient</th>
              <th>Order</th>
              <th>Type</th>
              <th>Status</th>
              <th>Collected</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id}>
                <td className="font-mono text-xs">{s.id}</td>
                <td className="font-mono text-xs font-semibold text-slate-900">{s.barcode}</td>
                <td className="font-medium text-slate-900">{s.patientName}</td>
                <td className="font-mono text-xs">{s.orderId}</td>
                <td>{s.sampleType}</td>
                <td>
                  <StatusBadge label={s.status} variant={statusVariant(s.status)} />
                </td>
                <td>{s.collectedAt ? formatDateTime(s.collectedAt) : '—'}</td>
                <td>{s.receivedAt ? formatDateTime(s.receivedAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function SamplesPage() {
  return (
    <div>
      <PageHeader
        title="Samples"
        description="Sample registration and tracking"
        action={
          <Link href="/samples/new" className="lims-btn-primary">
            Register Sample
          </Link>
        }
      />
      <Suspense fallback={null}>
        <SamplesContent />
      </Suspense>
    </div>
  );
}
