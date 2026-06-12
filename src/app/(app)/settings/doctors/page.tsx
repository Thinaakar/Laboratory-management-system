'use client';

import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { getReferrals } from '@/lib/data/store';
import { formatCurrency } from '@/lib/utils';

export default function SettingsDoctorsPage() {
  const doctors = getReferrals();

  return (
    <SettingsShell description="Referring doctors — used in appointments and orders">
      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Phone</th>
              <th>Referrals</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="font-medium text-slate-900">{doctor.doctorName}</td>
                <td>{doctor.specialty ?? '—'}</td>
                <td>{doctor.phone ?? '—'}</td>
                <td>{doctor.referralCount}</td>
                <td>{formatCurrency(doctor.revenueGenerated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsShell>
  );
}
