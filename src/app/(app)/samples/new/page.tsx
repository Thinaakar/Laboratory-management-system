'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { getOrders } from '@/lib/data/store';

export default function NewSamplePage() {
  const router = useRouter();
  const orders = getOrders();

  return (
    <div>
      <PageHeader
        title="Register Sample"
        description="Create sample record and generate barcode"
        action={
          <Link href="/samples" className="lims-btn-secondary">Back to list</Link>
        }
      />

      <form
        className="lims-card max-w-xl space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/lab-queue?success=sample');
        }}
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Order</label>
          <select className="lims-input" name="orderId" required defaultValue={orders[0]?.id}>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>{o.id} — {o.patientName}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Sample type</label>
            <select className="lims-input" name="sampleType" defaultValue="Blood">
              <option>Blood</option>
              <option>Urine</option>
              <option>Swab</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Barcode</label>
            <input className="lims-input" name="barcode" placeholder="Auto: BC2026…" defaultValue="BC20260003" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="lims-btn-primary">Register & Collect Sample</button>
          <Link href="/samples" className="lims-btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
