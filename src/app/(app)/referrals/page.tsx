'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnalyticsShell } from '@/components/lims/analytics/analytics-shell';
import { getLimsData } from '@/lib/api/use-lims-data';
import type { DoctorReferral } from '@/lib/types/lims';
import { formatCurrency } from '@/lib/utils';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<DoctorReferral[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const api = await getLimsData();
    setReferrals(await api.catalog.referrals());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
            {!ready ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-muted">
                  Loading referrals…
                </td>
              </tr>
            ) : referrals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-muted">
                  No referring doctors yet.
                </td>
              </tr>
            ) : (
              referrals.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium text-slate-900">{r.doctorName}</td>
                  <td>{r.specialty ?? '—'}</td>
                  <td>{r.phone ?? '—'}</td>
                  <td>{r.referralCount}</td>
                  <td>{formatCurrency(r.revenueGenerated)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AnalyticsShell>
  );
}
