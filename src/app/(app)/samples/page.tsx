'use client';

import { Plus } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { RegisterSampleModal } from '@/components/lims/samples/register-sample-modal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { getSamples } from '@/lib/data/store';
import { formatDateTime } from '@/lib/utils';

function SamplesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [samples, setSamples] = useState(getSamples());

  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setShowModal(true);
      window.history.replaceState(null, '', '/samples');
    }
  }, [searchParams]);

  return (
    <>
      <PageHeader
        title="Samples"
        description="Sample registration and tracking"
        action={
          <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
            <Plus className="h-4 w-4" />
            Register Sample
          </button>
        }
      />

      <FlashBanner />

      <div className="lims-card overflow-hidden">
        <div className="overflow-x-auto">
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
      </div>

      {showModal && (
        <RegisterSampleModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            setSamples(getSamples());
            router.push('/results?filter=pending&success=sample');
          }}
        />
      )}
    </>
  );
}

export default function SamplesPage() {
  return (
    <div>
      <Suspense fallback={null}>
        <SamplesContent />
      </Suspense>
    </div>
  );
}
