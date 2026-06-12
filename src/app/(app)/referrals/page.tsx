'use client';

import { AnalyticsShell } from '@/components/lims/analytics/analytics-shell';
import { getReferrals } from '@/lib/data/store';
import { formatCurrency } from '@/lib/utils';

export default function ReferralsPage() {
  const referrals = getReferrals();

  return (
    <AnalyticsShell>
      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Phone</th>
              <th>Referrals</th>
              <th>Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id}>
                <td className="font-medium text-slate-900">{r.doctorName}</td>
                <td>{r.specialty ?? '—'}</td>
                <td>{r.phone ?? '—'}</td>
                <td>{r.referralCount}</td>
                <td>{formatCurrency(r.revenueGenerated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalyticsShell>
  );
}
