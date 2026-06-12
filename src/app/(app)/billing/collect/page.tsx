'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { getInvoices } from '@/lib/data/store';

export default function CollectPaymentPage() {
  const router = useRouter();
  const invoices = getInvoices().filter((i) => i.status !== 'Paid');

  return (
    <div>
      <PageHeader
        title="Collect Payment"
        description="Record payment against an open invoice"
        action={
          <Link href="/billing" className="lims-btn-secondary">Back to billing</Link>
        }
      />

      <form
        className="lims-card max-w-xl space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/samples/new?success=payment');
        }}
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Invoice</label>
          <select className="lims-input" name="invoiceId" required defaultValue={invoices[0]?.id}>
            {invoices.length === 0 ? (
              <option value="">No pending invoices</option>
            ) : (
              invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} — {inv.patientName} (₹{inv.amount - inv.paidAmount} due)
                </option>
              ))
            )}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Amount</label>
            <input className="lims-input" type="number" name="amount" required placeholder="0" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Method</label>
            <select className="lims-input" name="method" defaultValue="UPI">
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="lims-btn-primary" disabled={invoices.length === 0}>
            Record Payment
          </button>
          <Link href="/billing" className="lims-btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
