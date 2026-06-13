'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { DoctorFormModal } from '@/components/lims/settings/doctor-form-modal';
import { addReferral, getReferrals } from '@/lib/data/referrals-store';
import { formatCurrency } from '@/lib/utils';
import type { DoctorReferral } from '@/lib/types/lims';

export default function SettingsDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorReferral[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setDoctors(getReferrals());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsShell description="Referring doctors — used in appointments and orders">
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
          onSave={(data) => {
            addReferral(data);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
