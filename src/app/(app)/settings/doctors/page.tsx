'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { DoctorFormModal } from '@/components/lims/settings/doctor-form-modal';
import { apiJson } from '@/lib/http/client';
import { formatCurrency } from '@/lib/utils';
import type { DoctorReferral } from '@/lib/types/lims';

export default function SettingsDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorReferral[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const res = await apiJson<{ data: DoctorReferral[] }>('/api/referrals');
      setDoctors(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load doctors.');
      setDoctors([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SettingsShell description="Referring doctors — used in appointments and orders">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Doctor
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Doctor ID</th>
              <th>Name</th>
              <th>Specialty</th>
              <th>Phone</th>
              <th>Referrals</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="font-mono text-xs">{doctor.id}</td>
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

      {showModal && (
        <DoctorFormModal
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await apiJson('/api/referrals', { method: 'POST', body: JSON.stringify(data) });
            setShowModal(false);
            await refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
