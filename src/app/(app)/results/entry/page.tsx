'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { getResults } from '@/lib/data/store';

export default function EnterResultsPage() {
  const router = useRouter();
  const results = getResults();

  return (
    <div>
      <PageHeader
        title="Enter Results"
        description="Record test values for processing samples"
        action={
          <Link href="/results" className="lims-btn-secondary">Back to results</Link>
        }
      />

      <form
        className="lims-card max-w-xl space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/reports/approval?success=results');
        }}
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Test</label>
          <select className="lims-input" name="resultId" required>
            {results.map((r) => (
              <option key={r.id} value={r.id}>{r.testName} — {r.orderId}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Value</label>
            <input className="lims-input" name="value" required placeholder="Result value" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Unit</label>
            <input className="lims-input" name="unit" placeholder="mg/dL, cells/µL…" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="critical" />
          Mark as critical value
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="lims-btn-primary">Save Result</button>
          <Link href="/results" className="lims-btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
